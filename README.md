# DOCme API

The web-based API that supports the DOCme platform. Built with Express.js to run in the Node.js runtine environment.

## Requirements

For development, you will only need Node.js and optionally nodemon (for hot-reload) installed in your environement.

### Node

- #### Node installation

Just go on [official Node.js website](https://nodejs.org/) and download the installer.
If the installation was successful, you should be able to run the following command and get back a version.
    
    $ node --version

- #### nodemon installation

    $ npm install -g nodemon

Go to [official nodemon website](https://nodemon.io) for more information if needed.

## Install
    $ npm install

## Configure environment variables

Copy the file `.env.example` to a new file named `.env` and then edit it with the environment specific settings. This new file will be ignored by Git (don't need to ever commit).
The variables you will need are:

- Environment ('development' or 'production')
- Database host
- Database username
- Database password
- Better Doctor API user key

## Running the project
    $ npm start
OR (for hot-reloading)

    $ nodemon

## Build for production

    $ npm build
