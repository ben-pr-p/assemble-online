# assemble.live

Secure, real time, audio and text based online meeting platform based on the exploitation of *space*.

Free and open source relying on only open source libraries: Node.js, Socket.io, EasyRTC, React, D3.

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

You'll also need to set `export DEBUG=assemble*` to see server side logs.

# Socket Events

## Client Emissions

### 'me' - emitted by App

### 'my-volume' - emitted by AudioController

### 'my-announcement' - emitted by Announcement

### 'my-location' - emitted by Room

## Server Emissions

### 'users' - handled by App

### 'locations' - handled by Room

### 'distances' - handled by AudioController

### 'dimensions' - handled by Room

### 'announcement' - handled by Announcement
