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

http = require 'http'

server = require 'wiki-server'

module.exports = exports = (argv) ->
  # Map incoming hosts to their wiki's port
  hosts = {}
  # Keep an array of servers that are currently active
  runningServers = []

  if argv.allowed
    allowed = argv.allowed.split(',')
    allow = (host) ->
      host.split(':')[0] in allowed
  else
    allow = () -> true


  farmServ = http.createServer (req, res) ->

    if req.headers?.host
      incHost = req.headers.host
    else
      res.statusCode = 400
      res.end('Missing host header')
      return

    # If the host starts with "www." treat it the same as if it didn't
    if incHost[0..3] is "www."
      incHost = incHost[4..]

    unless allow(incHost)
      res.statusCode = 400
      res.end('Invalid host')
      return

    # if we already have a port for this host, forward the request to it.
    if hosts[incHost]
      hosts[incHost](req, res)
    else
      # Create a new options object, copy over the options used to start the
      # farm, and modify them to make sense for servers spawned from the farm.

      # do deep copy, needed for database configuration for instance
      copy = (map) ->
          clone  = {}
          for key, value of map
            clone[key] = if typeof value == "object" then copy(value) else value
          clone

      newargv = copy argv

      newargv.data = if argv.data
        path.join(argv.data, incHost.split(':')[0])
      else
        path.join(argv.root, 'data', incHost.split(':')[0])
      newargv.url = "http://#{incHost}"
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
        hosts[incHost](req, res)

  runningFarmServ = farmServ.listen(argv.port, argv.host)
