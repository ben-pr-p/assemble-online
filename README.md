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
For performance reasons, all receiving and emitting all socket events is done through a SharedWorker. Thus, a client emission is implemented indirectly by posting a message to the SharedWorker, and a server emission is handled first by the SharedWorker which processes the data and posts the message to the proper component.

To make passing messages from the SharedWorker to a specific component easier, and to ensure re-renders happen as low in the component hierarchy as possible, I implemented a small helper class called `Boss`, which allows listeners to be bound which are called on specific emissions from the SharedWorker.

As of now, WebRTC is still handled in the main Javascript thread.

## Client Emissions

### 'me' - emitted by App

### 'my-volume' - emitted by AudioController

### 'my-announcement' - emitted by Announcement

### 'my-location' - emitted by Room

## Server Emissions

### 'users' - handled by App
users is a serialized Map

### 'locations' - handled by Room
locations is a serialized Map

### 'volumes' - handled by Announcement
volumes is a serialized Map

### 'distances' - handled by AudioController
distances is an object

### 'dimensions' - handled by Room
dimensions is an object

### 'announcement' - handled by Announcement
announcement is an object
