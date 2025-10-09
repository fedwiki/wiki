/*
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
 */

// **farm.coffee**
// The farm module works by putting a bouncy host based proxy
// in front of servers that it creates

import path from 'node:path'
import fs from 'node:fs'
import chokidar from 'chokidar'

import http from 'node:http'

import server from 'wiki-server'

import * as errorPage from './error-page.js'

export function farm(argv) {
  // Map incoming hosts to their wiki's port
  let allowDomain, allowHost, inWikiDomain, runningFarmServ, wikiDomains
  const hosts = {}
  // Keep an array of servers that are currently active
  const runningServers = []

  if (argv.allowed) {
    let allowedHosts
    if (argv.allowed === '*') {
      // we will allow any wiki which we have a directory exists
      const wikiDir = argv.data
      allowedHosts = fs
        .readdirSync(wikiDir, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name)

      // watch for new wiki directories being created (or deleted), and keep allowedHosts up to date
      const watcher = chokidar.watch(wikiDir, {
        persistent: true,
        ignoreInitial: true,
        depth: 0,
      })

      watcher
        .on('addDir', function (newWiki) {
          newWiki = path.basename(newWiki)
          allowedHosts.push(newWiki)
        })
        .on('unlinkDir', function (delWiki) {
          delWiki = path.basename(delWiki)
          // remove deleted wiki directory from the list of allowed wiki
          allowedHosts.splice(allowedHosts.indexOf(delWiki), 1)
          // TODO: if wiki server is already running, it needs to be stopped, if that is even possible.
        })
    } else {
      // we have a list of wiki that are allowed
      allowedHosts = argv.allowed
        .split(',') // split up the coma seperated list of allowed hosts
        .map(item => item.trim()) // trim any whitespace padding from the items in the list
    }

    allowHost = function (host) {
      const hostDomain = host.split(':')[0]
      if (allowedHosts.includes(hostDomain)) {
        return true
      } else {
        return false
      }
    }
  }

  if (argv.wikiDomains) {
    wikiDomains = Object.keys(argv.wikiDomains)
    inWikiDomain = ''
    allowDomain = function (host) {
      const hostDomain = host.split(':')[0]
      const possibleWikiDomain = []
      wikiDomains.forEach(function (domain) {
        const dotDomain = '.' + domain
        if (hostDomain === domain || hostDomain.endsWith(dotDomain)) {
          possibleWikiDomain.push(domain)
        }
      })
      if (possibleWikiDomain.length > 0) {
        inWikiDomain = possibleWikiDomain.reduce(function (a, b) {
          if (a.length > b.length) {
            return a
          } else {
            return b
          }
        })
        return true
      } else {
        return false
      }
    }
  } else {
    allowDomain = () => true
  }

  const allow = function (host) {
    // wikiDomains and allowed should both be optional
    if (argv.allowed) {
      if (allowHost(host)) {
        // host is in the allowed list
        if (argv.wikiDomains) {
          if (allowDomain(host)) {
            // host is within a defined wikiDomain
            return true
          } else {
            // while host is in the allowed list, it is not within an allowed domain
            return false
          }
        }
        return true
      } else {
        // host is not within the allowed list
        return false
      }
    }

    if (argv.wikiDomains) {
      if (allowDomain(host)) {
        // host is within a defined wikiDomain
        return true
      } else {
        // host is not within a defined wikiDomain
        return false
      }
    }

    // neither wikiDomain or allowed are configured
    return true
  }

  var farmServ = http.createServer(function (req, res) {
    let incHost
    if (req.headers?.host) {
      incHost = req.headers.host.split(':')[0]
    } else {
      res.statusCode = 400
      res.end('Missing host header')
      return
    }

    // If the host starts with "www." treat it the same as if it didn't
    if (incHost.slice(0, 4) === 'www.') {
      incHost = incHost.slice(4)
    }

    // if we already have a port for this host, forward the request to it.
    if (hosts[incHost]) {
      return hosts[incHost](req, res)
    } else {
      // check that request is for an allowed host
      if (!allow(incHost)) {
        const upHost = incHost.split('.').slice(1).join('.')
        res.statusCode = 400
        const errorText = errorPage.render(
          'Requested Wiki Does Not Exist',
          'The wiki you are trying to access does not exist.',
          `You may visit <a href='//${upHost}'>${upHost}</a> for more information.`,
        )
        res.end(errorText)
        return
      }

      // Create a new options object, copy over the options used to start the
      // farm, and modify them to make sense for servers spawned from the farm.

      // do deep copy, needed for nested configurations - e.g. config of wiki domains
      var clone = function (map) {
        let copy = undefined

        if (map === null || typeof map !== 'object') {
          return map
        }

        if (map instanceof Array) {
          copy = []
          let i = 0
          const len = map.length
          while (i < len) {
            copy[i] = clone(map[i])
            i++
          }
          return copy
        }

        if (typeof map === 'object') {
          copy = {}
          for (var attr in map) {
            copy[attr] = clone(map[attr])
          }
          return copy
        }

        console.log('Unsupported:', typeof map)
      }

      let newargv = clone(argv)

      newargv.data = argv.data
        ? path.join(argv.data, incHost.split(':')[0])
        : path.join(argv.root, 'data', incHost.split(':')[0])
      newargv.url = `http://${incHost}`

      // apply wiki domain configuration, if defined
      if (inWikiDomain) {
        newargv = Object.assign({}, newargv, newargv.wikiDomains[inWikiDomain])
        newargv.wiki_domain = inWikiDomain
      }

      // Create a new server, add it to the list of servers, and
      // once it's ready send the request to it.

      server(newargv).then(local => {
        hosts[incHost] = local
        runningServers.push(local)

        // patch in new neighbors
        if (argv.autoseed) {
          let neighbors = argv.neighbors ? argv.neighbors + ',' : ''
          neighbors += Object.keys(hosts).join(',')
          runningServers.forEach(server => (server.startOpts.neighbors = neighbors))
        }

        return local.once('owner-set', function () {
          local.emit('running-serv', farmServ)
          return hosts[incHost](req, res)
        })
      })
    }
  })

  // io = socketio(farmServ)
  return farmServ.listen(argv.port, argv.host)
}
