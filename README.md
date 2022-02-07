# Mage dev application repo 

## List of scripts

The server is set to run on port 3000 and client is set to run on 3001 (change client port to anything valid other than 3000 by going to local [package.json](https://github.com/TDP17/app-ui/blob/master/app-ui/package.json#L25) and editing value of set PORT=3001)<br />

### To start the app 
Navigate to the inner app-ui folder via `cd app-ui` and install dependencies via `npm install`<br />
`npm start` `npm run start` Runs the server and client<br />
`npm run devStart` Runs server with nodemon and client (need to install dev dependencies via npm install --production=false)<br />

### For testing/debugging purposes
`npm run start:server` Runs the server<br />
`npm run devStart:server` Runs the server with nodemon<br />
`npm run start:app` Runs the client<br />
 
 ## Other specs
+ Operating System - Windows 10<br />
+ typescript version 4.5.5<br />
+ npm version 8.3.0<br />
+ create-react-app version 5.0.0<br />
+ React version 17.0.2<br />
+ Node version 14.15.1<br />

#### Made by TDP17, takehome project for mage dev 02/22
