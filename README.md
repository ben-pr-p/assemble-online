# assemble.live

Real time online meeting platform based on the use and manipulation of *space*.
Built using Node.js, Socket.io, PeerJS, React, and SVG.

## Running locally

Make sure you have node, npm, and gulp installed, and that gulp is installed globally with `sudo npm install -g gulp`.

```
git clone https://github.com/assemble-live/assemble.git
cd assemble-live/
npm install
npm run bs
```

## Build processes

`gulp` -> `gulp build && gulp watch`, which will build and watch for changes
`npm run bs` -> `gulp build && node server/app.js`, which will build and serve the content
`npm start` -> `node server/app.js`, just start the server

For development, I have one tab open running `gulp` and one running `npm start`.
