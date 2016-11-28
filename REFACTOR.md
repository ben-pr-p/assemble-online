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
