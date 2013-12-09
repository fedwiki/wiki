#!/bin/env node
//  Federated Wiki (experimental version)
//
// Federated Wiki is install as a series of npm packages, see package.json
// This is just a wrapper to get the parameters that are needed, and get it started

var fs = require('fs');
var path = require('path');

// required as we will be requiring cli.coffee from the wiki package to run the wiki
require('coffee-script');

// The wiki wrapper just creates a config.json file, 
// and the starts the wiki.

var WikiWrapper = function() {

    // Scope.
    var self = this;

/* TODO: Review what config is required...
 
    // Set up variables.
    self.setupVariables = function() {
        // IP address and port
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            // Log errors but continue with 127.0.0.1 - to 
            // allow us to run/test locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }

        // Application URL - used by the Persona authentication
        self.url = "http://" + process.env.OPENSHIFT_APP_DNS;

        // Datastore options

        // Data Directory - provides persistent storage.
        self.data = process.env.OPENSHIFT_DATA_DIR;

        // Storetype, uncomment as required:
        //   1. flatfiles - no extra config required.
        //   2. leveldb
        // self.database = '{"type": "./leveldb"}';
        //   3. mongodb - requires additional OpenShift cartridge
        // to be added later...
        //   4. redis - requires custom OpenShift cartridge
        // to be added later...
    };
*/
    

    // terminator and setupTerminationHandlers are straight from the sample app...

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating wiki ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

/* TODO: Review setting up config file.
    // Initializes the application.
    self.initialize = function() {
        self.setupVariables();

        // do we already have a config file?
        if (fs.existsSync(path.join(process.env.OPENSHIFT_REPO_DIR, "config.json"))) {
            // remove the config file and create it afresh
            fs.unlinkSync(path.join(process.env.OPENSHIFT_REPO_DIR, "config.json"))
        }

        // create config file
        self.wikiOptions = {
            url: self.url,
            port: self.port,
            data: self.data,
            host: self.ipaddress
        };

        // if using anything other than flatfiles, add database to options
        if (!(typeof self.database === "undefined")) {
            self.wikiOptions.database = self.database
        }

        // convert to string, and save it
        self.wikiConfig = JSON.stringify(self.wikiOptions);

        fs.writeFileSync(path.join(process.env.OPENSHIFT_REPO_DIR, "config.json"), self.wikiConfig);

        self.setupTerminationHandlers();
    };
*/

    // Start the wiki
    self.start = function() {
        // start the wiki...

        // I'm sure there must be a better way of doing this, but it works and that is good enough

        var wikiCli = path.join(__dirname, '..', 'node_modules/wiki-server/lib/cli');
        wikiCli = path.resolve(wikiCli);
        require(wikiCli);
    };

};

/**
 *  main():  Main code.
 */
var zapp = new WikiWrapper();
// zapp.initialize();
zapp.start();

