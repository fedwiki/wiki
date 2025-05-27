/*
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
*/

// **cli.coffee** command line interface for the
// Smallest-Federated-Wiki express server

const http = require('http');
// socketio = require('socket.io')

const path = require('path');
const cluster = require('cluster');

const parseArgs = require('minimist');
const cc = require('config-chain');
const glob = require('glob');
const server = require('wiki-server');

const farm = require('./farm');

const getUserHome = () => process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

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
    v: 'version'
  }
}; 

const argv = parseArgs(process.argv.slice(2), opts);

const config = cc(argv,
  argv.config,
  'config.json',
  path.join(__dirname, '..', 'config.json'),
  path.join(getUserHome(), '.wiki', 'config.json'),
  cc.env('wiki_'), {
    port: 3000,
    root: path.dirname(require.resolve('wiki-server')),
    home: 'welcome-visitors',
    security_type: './security',
    data: path.join(getUserHome(), '.wiki'), // see also defaultargs
    packageDir: path.resolve(path.join(__dirname, 'node_modules')),
    cookieSecret: require('crypto').randomBytes(64).toString('hex')
  }
).store;

if (!config.commons) {
  config.commons = path.join(config.data, 'commons');
}

// If h/help is set print the help message and exit.
if (argv.help) {
  console.log(`\
Usage: wiki

Options:
  --help, -h          Show this help info and exit
  --config, --conf    Optional config file.
  --version, -v       Show version number and exit\
`);
  return;
}

// If v/version is set print the version of the wiki components and exit.
if (argv.version) {
  console.log('wiki: ' + require('./package').version);
  console.log('wiki-server: ' + require('wiki-server/package').version);
  console.log('wiki-client: ' + require('wiki-client/package').version);
  glob('wiki-security-*', {cwd: config.packageDir}, (e, plugins) => plugins.map(plugin => console.log(plugin + ": " + require(plugin + "/package").version)));
  glob('wiki-plugin-*', {cwd: config.packageDir}, (e, plugins) => plugins.map(plugin => console.log(plugin + ': ' + require(plugin + '/package').version)));
  return;
}

if (argv.test) {
  console.log("WARNING: Server started in testing mode, other options ignored");
  server({port: 33333, data: path.join(argv.root, 'spec', 'data')});
  return;
}

if (cluster.isMaster) {
  cluster.on('exit', function(worker, code, signal) {
    if (code === 0) {
      console.log('restarting wiki server');
      cluster.fork();
    } else {
      console.error('server unexpectly exitted, %d (%s)', worker.process.pid, signal || code);
    }
  });
  cluster.fork();
} else {
  if (config.farm) {
    console.log('Wiki starting in Farm mode, navigate to a specific server to start it.\n');
    if (!argv.wikiDomains && !argv.allowed) {
      console.log('WARNING : Starting Wiki Farm in promiscous mode\n');
    }
    if (argv.security_type === './security') {
      if (!argv.security_legacy) { console.log('INFORMATION : Using default security - Wiki Farm will be read-only\n'); }
    }
    farm(config);
  } else {
    const app = server(config);
    app.on('owner-set', function(e) {
      const local = http.Server(app);
      // app.io = socketio(local)

      const serv = local.listen(app.startOpts.port, app.startOpts.host);
      console.log("Federated Wiki server listening on", app.startOpts.port, "in mode:", app.settings.env);
      if (argv.security_type === './security') {
        if (!argv.security_legacy) { console.log('INFORMATION : Using default security - Wiki will be read-only\n'); }
      }
      app.emit('running-serv', serv);
    });
  }
}
