### Run Wiki in Docker containers with different storage backends

[docker-compose](https://docs.docker.com/compose/) allows to easily spin up docker containers with multiple wiki apps, couchdb and redis storage.
It is configured through `docker-compose.yml`. By uncommenting the redis and or couchdb paragraghs in `docker-compose.yml` more containers can be started.

     $ docker-compose up -d

If you are not installing the wiki components locally you will need to build the app container by running:

     $ docker-compose build
     $ docker-compose run web npm install
     $ docker-compose up -d

Visit $dockerhost:3000 to see your wiki.
On OSX $dockerhost can be determined by running: `boot2docker ip`. In case you are using [DLite](https://github.com/nlf/dlite) on OSX, $dockerhost is going to be `local.docker`. If you are using [Docker for OSX](https://docs.docker.com/engine/installation/mac/#docker-for-mac), $dockerhost is going to be `localhost`. On Linux the containers bind to 0.0.0.0
The wiki source directory gets mounted into the app containers under /usr/src/app
