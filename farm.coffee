###
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
###

# **farm.coffee**
# The farm module works by putting a bouncy host based proxy
# in front of servers that it creates

path = require 'path'
fs = require 'fs'
chokidar = require 'chokidar'

http = require 'http'

server = require 'wiki-server'

_ = require('lodash')

module.exports = exports = (argv) ->
  # Map incoming hosts to their wiki's port
  hosts = {}
  # Keep an array of servers that are currently active
  runningServers = []

  # if farm is restricting new wiki creation, keep a list of existing wiki within the farm
  existingWiki = []

  if argv.restrict
    wikiDir = if argv.data
      argv.data
    else
      path.join(argv.root, 'data')
    # 
    existingWiki = fs.readdirSync(wikiDir, {withFileTypes: true})
      .filter (item) -> item.isDirectory()
      .map (item) -> item.name

    # we don't want to have to restart wiki each time a new wiki is added, so watch for new wiki directories
    watcher = chokidar.watch wikiDir, {
      persistent: true
      ignoreInitial: true
      depth: 0
    }

    watcher
      .on('addDir', (newWiki) -> 
        newWiki = path.basename(newWiki)
        existingWiki.push(newWiki)
      .on('unlinkDir', (delWiki) -> 
        delWiki = path.basename(delWiki)
        _.pull(existingWiki, delWiki)



  if argv.allowed
    allowedHosts = _.split(argv.allowed, ',')
    allowHost = (host) ->
      hostDomain = _.split(host, ':')[0]
      if _.includes(allowedHosts, hostDomain)
        return true
      else
        return false

  if argv.wikiDomains
    wikiDomains = _.keys(argv.wikiDomains)
    inWikiDomain = ''
    allowDomain = (host) ->
      hostDomain = _.split(host, ':')[0]
      inWikiDomain = ''
      _.each wikiDomains, (domain) ->
        if _.endsWith hostDomain, domain
          inWikiDomain = domain
      if inWikiDomain
        return true
      else
        return false
  else
    allowDomain = () -> true

  allow = (host) ->
    # if a farm is restricting new wiki we will only let the wiki server start if directory for the wiki already exists
    if argv.restrict and !existingWiki.includes(host)
      return false
    # wikiDomains and allowed should both be optional
    if argv.allowed and allowHost(host)
      return true
    else
      if argv.wikiDomains and allowDomain(host)
        # host is within a defined wikiDomain
        return true
      else
        if argv.wikiDomains or argv.allowed
          # host is in the list of allowed hosts
          return false
        else
          # neither wikiDomain or allowed are configured
          return true


  farmServ = http.createServer (req, res) ->

    if req.headers?.host
      incHost = req.headers.host.split(':')[0]
    else
      res.statusCode = 400
      res.end('Missing host header')
      return

    # If the host starts with "www." treat it the same as if it didn't
    if incHost[0..3] is "www."
      incHost = incHost[4..]


    # if we already have a port for this host, forward the request to it.
    if hosts[incHost]
      hosts[incHost](req, res)
    else

      # check that request is for an allowed host
      unless allow(incHost)
        res.statusCode = 400
        res.end('Invalid host')
        return


      # Create a new options object, copy over the options used to start the
      # farm, and modify them to make sense for servers spawned from the farm.

      # do deep copy, needed for nested configurations - e.g. config of wiki domains
      clone = (map) ->
        copy = undefined

        if map is null or typeof map isnt 'object'
          return map

        if  map instanceof Array
          copy = []
          i = 0
          len = map.length
          while i < len
            copy[i] = clone(map[i])
            i++
          return copy

        if typeof map is 'object'
          copy = {}
          for attr of map
            copy[attr] = clone(map[attr])
          return copy

        console.log "Unsupported:", typeof map
        return

      newargv = clone argv

      newargv.data = if argv.data
        path.join(argv.data, incHost.split(':')[0])
      else
        path.join(argv.root, 'data', incHost.split(':')[0])
      newargv.url = "http://#{incHost}"

      # apply wiki domain configuration, if defined
      if inWikiDomain
        newargv = _.assignIn newargv, newargv.wikiDomains[inWikiDomain]
        newargv.wiki_domain = inWikiDomain

      # Create a new server, add it to the list of servers, and
      # once it's ready send the request to it.
      local = server(newargv)
      hosts[incHost] = local
      runningServers.push(local)

      # patch in new neighbors
      if argv.autoseed

        neighbors = if argv.neighbors then argv.neighbors + ',' else ''
        neighbors += Object.keys(hosts).join(',')
        runningServers.forEach (server) ->
          server.startOpts.neighbors = neighbors

      local.once "owner-set", ->
        local.emit 'running-serv', farmServ
        hosts[incHost](req, res)

  runningFarmServ = farmServ.listen(argv.port, argv.host)
