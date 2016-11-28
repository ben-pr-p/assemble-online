# Plans

## Production Env

Switch to open shift

Why?
* Open source
* Easier to migrate to personal cloud later
* Redhat

## Back end

Rewrite as series of functional microservices communicating
with Redis

Why?
* Easier to test (maintain)
* Easier to test (stress test)
* Easier to scale
* Optional use of other languages in microservice
* Easier to add additional metrics

## Front End

Migrate to preact

Why?
* Faster, 3kb
* No longer want to use Material-UI
* Material-UI abstracts too much away from me

SVG -> HTML

Why?
* Easier expansion of elements
* Hardware accelerated CSS animations with `transform`
* Easier 3D

## WebRTC

Implement custom signaling server and browser abstraction

Why?
* EasyRTC is bulky - 286 kb! That's more than the rest of my build.
* I will eventually need to dive deep into the signaling internals - might as well start now
* EasyRTC is inconsistent with the rest of the project's conventions
** Modular vs globals on front-end
* EasyRTC abstracts user id management with the `easyrtcids` - annoying extra bit of info to maintain
