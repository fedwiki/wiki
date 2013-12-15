# Federated Wiki (Node.js server version)

> The original wiki was written in a week and cloned within a week after that.
> The concept was shown to be fruitful while leaving other implementers room to innovate.
> When we ask for simple, we are looking for the same kind of simplicity: nothing to distract from our innovation in federation.
> -- <cite>[Smallest Federated Wiki](https://github.com/WardCunningham/Smallest-Federated-Wiki)

Since the earlier creation of the node version, to complement the original Ruby implementation, there has been a risk of the two versions diverging. A first step to prevent divergence was to extract the client code into the [wiki-client](https://github.com/WardCunningham/wiki-client). This wiki-client was then used by both the Ruby and Node servers. However, with both server repositories retained the static components of the client, together with the plug-ins there remained some risk of divergence.

In this latest version of the node version of Federated Wiki, we continue by:
* including all the client components in the wiki-client, and
* removing all plug-ins into their own repositories, see below for a list.

When we originally extracted the wiki-client, we included it back into wiki whilst building the wiki package. This had the unforeseen consequence that when creating an updated wiki-client it was also necessary to create a new version of the wiki package for the updated client to be available. To avoid this we no longer include wiki packages in the package for the server. 

As a result the wiki repository, and package, just contains the wiki server and will become the wiki-server respository and package.

Here we have a new wiki repository, and package, *currently called wiki-exp (as it comes from an experimental re-factor)* which only exist to pull together the federated wiki modules (wiki-server, wiki-client, and plug-ins) and start the server.

## Using Federated Wiki

Learn [how to wiki](http://fed.wiki.org/view/how-to-wiki) by reading [fed.wiki.org](http://fed.wiki.org/view/welcome-visitors)

## Running your own Server

The quickest way to set up wiki on your local machine is to install it globally with `npm`:

    $ npm install -g wiki-exp
    $ wiki-exp

<span style="padding-left: 1em; border-left: 1em solid rgb(224,216,216); background-color: rbg(192,192,192);">:warning: The default location used to store your pages *should not* be used for more than testing. Any content you create will be lost when you update the package, or run ```npm update -g```. See Datastore options, below, on how to specify an alternative location.
</span>

Visit localhost:3000 to see your wiki. If you choose a host visible to the internet then others in the federation can use your work.

## Server Options

Options for the server can be passed in many ways:

* As command line flags
* As a configuration JSON file specified with --config
* As a config.json file in the root folder or cwd.
* As env vars prefixed with `wiki_`

Higher in the list takes precedence.
The server will then try to guess all unspecified options. 

### Datastore options

A number of datastores are supported. Use the --database and --data options to configure, or use the config.json.

#### flatfiles (default)

The default path to store page data is in a "default-data" subdirectory of the install directory. You can override it like this:

    $ wiki --data FILESYSTEM_PATH

#### mongodb

The mongodb connection arguments are specified as follows:

    $ wiki --database '{"type": "./mongodb", "url": "...", "options": {...}}'

For convenience the url will also be read from MONGO_URI, MONGOLAB_URI, or MONGOHQ_URL. This smooths the Heroku deployment process somewhat.

The mongodb datastore allows for a graceful upgrade path. If a page is not found in mongodb the flatfile datastore will be consulted.

#### redis

The Redis connection arguments are specified as follows:

    $ wiki --database '{"type": "./redis", "host": "...", "port": nnn, "options": {...}}'

The Redis datastore allows for a graceful upgrade path. If a page is not found in redis the flatfile datastore will be consulted.

#### leveldb

The leveldb datastore uses JSON encoded leveldb format and is configured by providing a filesystem path:

    $ wiki --database '{"type": "./leveldb"}' --data FILESYSTEM_PATH

The leveldb datastore allows for a graceful upgrade path. If a page is not found in leveldb the flatfile datastore will be consulted.


## Developing Wiki

The wiki consists of a number of GitHub repositories / packages, that contain the server, client and plugins. You will need to get the code for this repository together with that for the other components you wish to work on.

The current repositories are (**N.B.** location of all these repositories will change):
* wiki-server [paul90/wiki - paul90/refactor branch](https://github.com/paul90/wiki/tree/paul90/refactor)
* wiki-client [paul90/wiki-client - paul90/refactor branch](https://github.com/paul90/wiki-client/tree/paul90/refactor)
* wiki-plugin-activity [paul90/wiki-plugin-activity](https://github.com/paul90/wiki-plugin-activity)
* wiki-plugin-bytebeat [paul90/wiki-plugin-bytebeat](https://github.com/paul90/wiki-plugin-bytebeat)
* wiki-plugin-calculator [paul90/wiki-plugin-calculator](https://github.com/paul90/wiki-plugin-calculator)
* wiki-plugin-calendar [paul90/wiki-plugin-calendar](https://github.com/paul90/wiki-plugin-calendar)
* wiki-plugin-changes [paul90/wiki-plugin-changes](https://github.com/paul90/wiki-plugin-changes)
* wiki-plugin-chart [paul90/wiki-plugin-chart](https://github.com/paul90/wiki-plugin-chart)
* wiki-plugin-code [paul90/wiki-plugin-code](https://github.com/paul90/wiki-plugin-code)
* wiki-plugin-data [paul90/wiki-plugin-data](https://github.com/paul90/wiki-plugin-data)
* wiki-plugin-efficiency [paul90/wiki-plugin-efficiency](https://github.com/paul90/wiki-plugin-efficiency)
* wiki-plugin-factory [paul90/wiki-plugin-factory](https://github.com/paul90/wiki-plugin-factory)
* wiki-plugin-favicon [paul90/wiki-plugin-favicon](https://github.com/paul90/wiki-pluginfavicon)
* wiki-plugin-federatedwiki [paul90/wiki-plugin-federatedwiki](https://github.com/paul90/wiki-plugin-federatedwiki)
* wiki-plugin-force [paul90/wiki-plugin-force](https://github.com/paul90/wiki-plugin-force)
* wiki-plugin-image [paul90/wiki-plugin-image](https://github.com/paul90/wiki-plugin-image)
* wiki-plugin-line [paul90/wiki-plugin-line](https://github.com/paul90/wiki-plugin-line)
* wiki-plugin-linkmap [paul90/wiki-plugin-linkmap](https://github.com/paul90/wiki-plugin-linkmap)
* wiki-plugin-logwatch [paul90/wiki-plugin-logwatch](https://github.com/paul90/wiki-plugin-logwatch)
* wiki-plugin-map [paul90/wiki-plugin-map](https://github.com/paul90/wiki-plugin-map)
* wiki-plugin-mathjax [paul90/wiki-plugin-mathjax](https://github.com/paul90/wiki-plugin-mathjax)
* wiki-plugin-metabolism [paul90/wiki-plugin-metabolism](https://github.com/paul90/wiki-plugin-metabolism)
* wiki-plugin-method [paul90/wiki-plugin-method](https://github.com/paul90/wiki-plugin-method)
* wiki-plugin-pagefold [paul90/wiki-plugin-pagefold](https://github.com/paul90/wiki-plugin-pagefold)
* wiki-plugin-paragraph [paul90/wiki-plugin-paragraph](https://github.com/paul90/wiki-plugin-paragraph)
* wiki-plugin-parse [paul90/wiki-plugin-parse](https://github.com/paul90/wiki-plugin-parse)
* wiki-plugin-pushpin [paul90/wiki-plugin-pushpin](https://github.com/paul90/wiki-plugin-pushpin)
* wiki-plugin-radar [paul90/wiki-plugin-radar](https://github.com/paul90/wiki-plugin-radar)
* wiki-plugin-reduce [paul90/wiki-plugin-reduce](https://github.com/paul90/wiki-plugin-reduce)
* wiki-plugin-reference [paul90/wiki-plugin-reference](https://github.com/paul90/wiki-plugin-reference)
* wiki-plugin-report [paul90/wiki-plugin-report](https://github.com/paul90/wiki-plugin-report)
* wiki-plugin-rollup [paul90/wiki-plugin-rollup](https://github.com/paul90/wiki-plugin-rollup)
* wiki-plugin-scatter [paul90/wiki-plugin-scatter](https://github.com/paul90/wiki-plugin-scatter)
* wiki-plugin-twadio [paul90/wiki-plugin-twadio](https://github.com/paul90/wiki-plugin-twadio)
* wiki-plugin-txtzyme [paul90/wiki-plugin-txtzyme](https://github.com/paul90/wiki-plugin-txtzyme)

It is possible to include a package, you are working on, into the wiki-exp project by using npm. The two options are: i) using ```npm install``` with the path to the source of the package you want to include, or ii) ```npm link```. Using ```npm install``` is preferred but will need repeating to include any code changes.

If, for example, you were working on the ```method``` plug-in, you would do something like the following:

	$ git clone https://github.com/paul90/wiki-exp.git
	$ git clone https://github.com/paul90/wiki-plugin-method.git
	$ cd wiki
	$ npm install
	$ cd ../wiki-plugin-method
	$ npm install
	...
	... modify the method package as required
	...
	$ grunt build
	$ cd ../wiki-exp
	$ npm install ../wiki-plugin-method
	$ npm start



## How to Participate

* Join the developer IRC channel, `#fedwiki` on freenode
* Stop by the [Google Hangout](http://bit.ly/SFWhangout) at 10am Pacific every Wednesday
* Submit [Issues](https://github.com/WardCunningham/wiki/issues) 
* Fork, commit and submit [Pull Requests](https://github.com/WardCunningham/wiki/pulls)


## License

You may use the Wiki under either the
[MIT License](https://github.com/WardCunningham/wiki/blob/master/mit-license.txt) or the
[GNU General Public License](https://github.com/WardCunningham/wiki/blob/master/gpl-license.txt) (GPL) Version 2.
