# DOCme API

The web-based API that supports the DOCme platform. Built with Express.js to run in the Node.js runtine environment.


## Requirements

For development, you will only need Node.js and optionally nodemon (for hot-reload) installed in your environement.

### Node
- #### Node installation

Just go on [official Node.js website](https://nodejs.org/) and download the installer.
If the installation was successful, you should be able to run the following command and get back a version.
    $ node --version


## Install
    $ npm install


## Configure app

Open `/helpers/database.js` then edit it with your settings. You will need:

- Database host
- Database username
- Database password


## Running the project
    $ npm start
OR (for hot-reloading)

    $ nodemon


## Build for production

    $ npm build
