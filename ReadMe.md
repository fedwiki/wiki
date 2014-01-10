# Federated Wiki (Node.js server version)

> The original wiki was written in a week and cloned within a week after that.
> The concept was shown to be fruitful while leaving other implementers room to innovate.
> When we ask for simple, we are looking for the same kind of simplicity: nothing to distract from our innovation in federation.
> -- <cite>[Smallest Federated Wiki](https://github.com/WardCunningham/Smallest-Federated-Wiki)

Since the earlier creation of the node version, to complement the original Ruby implementation, there has been a risk of the two versions diverging. A first step to prevent divergence was to extract the client code into the [wiki-client](https://github.com/WardCunningham/wiki-client). This wiki-client was then used by both the Ruby and Node servers. However, with both server repositories retained the static components of the client, together with the plug-ins there remained some risk of divergence.

In this latest version of the node version of Federated Wiki, we continue by:
* including all the client components in the wiki-client, and
* moving all plug-ins into their own repositories, see below for a list.

When we originally extracted the wiki-client, we included it back into wiki whilst building the wiki package. This had the unforeseen consequence that when creating an updated wiki-client it was also necessary to create a new version of the wiki package for the updated client to be available. To avoid this we no longer include wiki packages in the package for the server. 

Here we have a new wiki repository, and package, which only exist to pull together the federated wiki modules (wiki-node-server, wiki-client, and plug-ins) and start the server.

## Using Federated Wiki

Learn [how to wiki](http://fed.wiki.org/view/how-to-wiki) by reading [fed.wiki.org](http://fed.wiki.org/view/welcome-visitors)

## Running your own Server

The quickest way to set up wiki on your local machine is to install it globally with `npm`:

    $ npm install -g wiki
    $ wiki

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

The default location of the datastore is ```~/.wiki```, which contains two sub-directories ```pages``` and ```status```:
* ```pages``` is used with flatfiles, or leveldb, to store your pages, and
* ```status``` stores the site's favicon, and a file containing the identity (email address) of the site owner.

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

* wiki-server [fedwiki/wiki-node-server](https://github.com/fedwiki/wiki-node-server)
* wiki-client [fedwiki/wiki-client](https://github.com/fedwiki/wiki-client)
* wiki-plugin-activity [fedwiki/wiki-plugin-activity](https://github.com/fedwiki/wiki-plugin-activity)
* wiki-plugin-bars [fedwiki/wiki-plugin-bars](https://github/fedwiki/wiki-plugin-bars)
* wiki-plugin-bytebeat [fedwiki/wiki-plugin-bytebeat](https://github.com/fedwiki/wiki-plugin-bytebeat)
* wiki-plugin-calculator [fedwiki/wiki-plugin-calculator](https://github.com/fedwiki/wiki-plugin-calculator)
* wiki-plugin-calendar [fedwiki/wiki-plugin-calendar](https://github.com/fedwiki/wiki-plugin-calendar)
* wiki-plugin-changes [fedwiki/wiki-plugin-changes](https://github.com/fedwiki/wiki-plugin-changes)
* wiki-plugin-chart [fedwiki/wiki-plugin-chart](https://github.com/fedwiki/wiki-plugin-chart)
* wiki-plugin-code [fedwiki/wiki-plugin-code](https://github.com/fedwiki/wiki-plugin-code)
* wiki-plugin-data [fedwiki/wiki-plugin-data](https://github.com/fedwiki/wiki-plugin-data)
* wiki-plugin-efficiency [fedwiki/wiki-plugin-efficiency](https://github.com/fedwiki/wiki-plugin-efficiency)
* wiki-plugin-factory [fedwiki/wiki-plugin-factory](https://github.com/fedwiki/wiki-plugin-factory)
* wiki-plugin-favicon [fedwiki/wiki-plugin-favicon](https://github.com/fedwiki/wiki-pluginfavicon)
* wiki-plugin-federatedwiki [fedwiki/wiki-plugin-federatedwiki](https://github.com/fedwiki/wiki-plugin-federatedwiki)
* wiki-plugin-force [fedwiki/wiki-plugin-force](https://github.com/fedwiki/wiki-plugin-force)
* wiki-plugin-image [fedwiki/wiki-plugin-image](https://github.com/fedwiki/wiki-plugin-image)
* wiki-plugin-line [fedwiki/wiki-plugin-line](https://github.com/fedwiki/wiki-plugin-line)
* wiki-plugin-linkmap [fedwiki/wiki-plugin-linkmap](https://github.com/fedwiki/wiki-plugin-linkmap)
* wiki-plugin-logwatch [fedwiki/wiki-plugin-logwatch](https://github.com/fedwiki/wiki-plugin-logwatch)
* wiki-plugin-map [fedwiki/wiki-plugin-map](https://github.com/fedwiki/wiki-plugin-map)
* wiki-plugin-mathjax [fedwiki/wiki-plugin-mathjax](https://github.com/fedwiki/wiki-plugin-mathjax)
* wiki-plugin-metabolism [fedwiki/wiki-plugin-metabolism](https://github.com/fedwiki/wiki-plugin-metabolism)
* wiki-plugin-method [fedwiki/wiki-plugin-method](https://github.com/fedwiki/wiki-plugin-method)
* wiki-plugin-pagefold [fedwiki/wiki-plugin-pagefold](https://github.com/fedwiki/wiki-plugin-pagefold)
* wiki-plugin-paragraph [fedwiki/wiki-plugin-paragraph](https://github.com/fedwiki/wiki-plugin-paragraph)
* wiki-plugin-parse [fedwiki/wiki-plugin-parse](https://github.com/fedwiki/wiki-plugin-parse)
* wiki-plugin-pushpin [fedwiki/wiki-plugin-pushpin](https://github.com/fedwiki/wiki-plugin-pushpin)
* wiki-plugin-radar [fedwiki/wiki-plugin-radar](https://github.com/fedwiki/wiki-plugin-radar)
* wiki-plugin-reduce [fedwiki/wiki-plugin-reduce](https://github.com/fedwiki/wiki-plugin-reduce)
* wiki-plugin-reference [fedwiki/wiki-plugin-reference](https://github.com/fedwiki/wiki-plugin-reference)
* wiki-plugin-report [fedwiki/wiki-plugin-report](https://github.com/fedwiki/wiki-plugin-report)
* wiki-plugin-rollup [fedwiki/wiki-plugin-rollup](https://github.com/fedwiki/wiki-plugin-rollup)
* wiki-plugin-scatter [fedwiki/wiki-plugin-scatter](https://github.com/fedwiki/wiki-plugin-scatter)
* wiki-plugin-twadio [fedwiki/wiki-plugin-twadio](https://github.com/fedwiki/wiki-plugin-twadio)
* wiki-plugin-txtzyme [fedwiki/wiki-plugin-txtzyme](https://github.com/fedwiki/wiki-plugin-txtzyme)

It is possible to include a package, you are working on, into the wiki-node project by using npm. The two options are: i) using ```npm install``` with the path to the source of the package you want to include, or ii) ```npm link```. While ```npm link``` is useful during the early development of a new plug-in, as it uses symbolic links it does not give the same content as installing the package. For the later stages of development, and bug fixing, using ```npm install``` is preferred, but it will need repeating to include any code changes.

If, for example, you were working on the ```method``` plug-in, you would do something like the following:

  On the GitHub site, create a fork of the repositories you are going to work on, and then:

	$ git clone https://github.com/.../wiki-node.git
	$ git clone https://github.com/.../wiki-plugin-method.git
	$ cd wiki-node
	$ npm install
	$ cd ../wiki-plugin-method
	$ npm install
	...
	... modify the method package as required
	...
	$ grunt build
	$ cd ../wiki-node
	$ npm install ../wiki-plugin-method
	$ npm start
  
  Open site and test your changes.



## How to Participate

* Join the developer IRC channel, `#fedwiki` on freenode
* Stop by the Google Hangout at 10am Pacific every Wednesday - the Hangout URL is published in [Ward's twitter](https://twitter.com/WardCunningham), and on the [Frequently Asked Questions](http://fed.wiki.org/frequently-asked-questions.html) page.
* Submit [Issues](https://github.com/WardCunningham/wiki/issues) 
* Fork, commit and submit [Pull Requests](https://github.com/WardCunningham/wiki/pulls)


## License

You may use the Wiki under either the
[MIT License](https://github.com/WardCunningham/wiki/blob/master/mit-license.txt) or the
[GNU General Public License](https://github.com/WardCunningham/wiki/blob/master/gpl-license.txt) (GPL) Version 2.
