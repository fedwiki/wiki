/*
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
 */

// **cli.coffee** command line interface for the
// Smallest-Federated-Wiki express server

import http from 'node:http'

import path from 'node:path'
import url from 'node:url'
import cluster from 'node:cluster'

import fs from 'node:fs/promises'
import crypto from 'node:crypto'

import minimist from 'minimist'
const parseArgs = minimist

import server from 'wiki-server'

import { farm } from './farm.js'
import { version } from './version.js'
import { exit } from 'node:process'

const getUserHome = () => process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

// Handle command line options

const opts = {
  alias: {
    u: 'url',
    p: 'port',
    d: 'data',
    r: 'root',
    f: 'farm',
    o: 'host',
    h: 'help',
    conf: 'config',
    v: 'version',
  },
}

const argv = parseArgs(process.argv.slice(2), opts)

// replacing config-chain
const createConfig = async (...sources) => {
  const config = {}
  for (const source of sources) {
    if (source && typeof source === 'object') {
      Object.assign(config, source)
    } else if (typeof source === 'string') {
      try {
        const jsonConfig = JSON.parse(await fs.readFile(source, 'utf-8'))
        Object.assign(config, jsonConfig)
      } catch (error) {
        // skip silently
      }
    }
  }
  return config
}

const parseEnvVars = prefix => {
  return Object.fromEntries(Object.entries(process.env).filter(([k, v]) => k.startsWith(prefix)))
}

const defaultConfig = {
  port: 3000,
  root: path.dirname(url.fileURLToPath(import.meta.resolve('wiki-server'))),
  home: 'welcome-visitors',
  security_type: './security.js',
  data: path.join(getUserHome(), '.wiki'), // see also defaultargs
  packageDir: path.resolve(path.join(path.dirname(new URL(import.meta.url).pathname), 'node_modules')),
  cookieSecret: crypto.randomBytes(64).toString('hex'),
}

// Create config by merging sources in priority order
// while some of thise config sources are unlikely, they are needed for backward compatability.
const config = await createConfig(
  defaultConfig, // lowest priority
  parseEnvVars('wiki_'), // environment variables
  path.join(getUserHome(), '.wiki', 'config.json'), // user config
  path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'config.json'), // parent dir config
  'config.json', // current dir config
  argv.config, // specified config file
  argv, // command line args (highest priority)
)

if (!config.commons) {
  config.commons = path.join(config.data, 'commons')
}

// If h/help is set print the help message and exit.
if (argv.help) {
  console.log(`\
Usage: wiki

Options:
  --help, -h          Show this help info and exit
  --config, --conf    Optional config file.
  --version, -v       Show version number and exit\
`)
} else if (argv.version) {
  // If v/version is set print the version of the wiki components and exit.
  version()
} else if (argv.test) {
  console.log('WARNING: Server started in testing mode, other options ignored')
  server({ port: 33333, data: path.join(argv.root, 'spec', 'data') })
} else if (cluster.isPrimary) {
  cluster.on('exit', function (worker, code, signal) {
    if (code === 0) {
      console.log('restarting wiki server')
      cluster.fork()
    } else {
      console.error('server unexpectly exitted, %d (%s)', worker.process.pid, signal || code)
    }
  })
  cluster.fork()
} else {
  if (config.farm) {
    console.log('Wiki starting in Farm mode, navigate to a specific server to start it.\n')
    if (!argv.wikiDomains && !argv.allowed) {
      console.log('WARNING : Starting Wiki Farm in promiscous mode\n')
    }
    if (argv.security_type === './security.js') {
      if (!argv.security_legacy) {
        console.log('INFORMATION : Using default security - Wiki Farm will be read-only\n')
      }
    }
    farm(config)
  } else {
    server(config).then(app => {
      app.on('owner-set', function (e) {
        const local = http.Server(app)
        // app.io = socketio(local)

        const serv = local.listen(app.startOpts.port, app.startOpts.host)
        console.log('Federated Wiki server listening on', app.startOpts.port, 'in mode:', app.settings.env)
        if (argv.security_type === './security.js') {
          if (!argv.security_legacy) {
            console.log('INFORMATION : Using default security - Wiki will be read-only\n')
          }
        }
        app.emit('running-serv', serv)
      })
    })

    // const app = server(config)
    // app.on('owner-set', function (e) {
    //   const local = http.Server(app)
    //   // app.io = socketio(local)

    //   const serv = local.listen(app.startOpts.port, app.startOpts.host)
    //   console.log('Federated Wiki server listening on', app.startOpts.port, 'in mode:', app.settings.env)
    //   if (argv.security_type === './security') {
    //     if (!argv.security_legacy) {
    //       console.log('INFORMATION : Using default security - Wiki will be read-only\n')
    //     }
    //   }
    //   app.emit('running-serv', serv)
    // })
  }
}
