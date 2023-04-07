###
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
###

# **cli.coffee** command line interface for the
# Smallest-Federated-Wiki express server

http = require('http')
# socketio = require('socket.io')

path = require 'path'
cluster = require 'cluster'

parseArgs = require 'minimist'
cc = require 'config-chain'
glob = require 'glob'
server = require 'wiki-server'

farm = require './farm'

getUserHome = ->
  process.env.HOME or process.env.HOMEPATH or process.env.USERPROFILE

# Handle command line options

opts = {
  alias: {
    u: 'url'
    p: 'port'
    d: 'data'
    r: 'root'
    f: 'farm'
    o: 'host'
    h: 'help'
    conf: 'config'
    v: 'version'
  }
} 

argv = parseArgs(process.argv.slice(2), opts)

config = cc(argv,
  argv.config,
  'config.json',
  path.join(__dirname, '..', 'config.json'),
  path.join(getUserHome(), '.wiki', 'config.json'),
  cc.env('wiki_'),
    port: 3000
    root: path.dirname(require.resolve('wiki-server'))
    home: 'welcome-visitors'
    security_type: './security'
    data: path.join(getUserHome(), '.wiki') # see also defaultargs
    packageDir: path.resolve(path.join(__dirname, 'node_modules'))
    cookieSecret: require('crypto').randomBytes(64).toString('hex')
).store

unless config.commons
  config.commons = path.join(config.data, 'commons')

# If h/help is set print the help message and exit.
if argv.help
  console.log("""
  Usage: wiki

  Options:
    --help, -h          Show this help info and exit
    --config, --conf    Optional config file.
    --version, -v       Show version number and exit
  """)
  return

# If v/version is set print the version of the wiki components and exit.
if argv.version
  console.log('wiki: ' + require('./package').version)
  console.log('wiki-server: ' + require('wiki-server/package').version)
  console.log('wiki-client: ' + require('wiki-client/package').version)
  glob 'wiki-security-*', {cwd: config.packageDir}, (e, plugins) ->
    plugins.map (plugin) ->
      console.log(plugin + ": " + require(plugin + "/package").version)
  glob 'wiki-plugin-*', {cwd: config.packageDir}, (e, plugins) ->
    plugins.map (plugin) ->
      console.log(plugin + ': ' + require(plugin + '/package').version)
  return

if argv.test
  console.log "WARNING: Server started in testing mode, other options ignored"
  server({port: 33333, data: path.join(argv.root, 'spec', 'data')})
  return

if cluster.isMaster
  cluster.on 'exit', (worker, code, signal) ->
    if code is 0
      console.log 'restarting wiki server'
      cluster.fork()
    else
      console.error 'server unexpectly exitted, %d (%s)', worker.process.pid, signal || code
  cluster.fork()
else
  if config.farm
    console.log('Wiki starting in Farm mode, navigate to a specific server to start it.\n')
    if !argv.wikiDomains and !argv.allowed
      console.log 'WARNING : Starting Wiki Farm in promiscous mode\n'
    if argv.security_type is './security'
      console.log 'INFORMATION : Using default security - Wiki Farm will be read-only\n' unless (argv.security_legacy)
    farm(config)
  else
    app = server(config)
    app.on 'owner-set', (e) ->
      server = http.Server(app)
      # app.io = socketio(server)

      serv = server.listen app.startOpts.port, app.startOpts.host
      console.log "Federated Wiki server listening on", app.startOpts.port, "in mode:", app.settings.env
      if argv.security_type is './security'
        console.log 'INFORMATION : Using default security - Wiki will be read-only\n' unless (argv.security_legacy)
      app.emit 'running-serv', serv
