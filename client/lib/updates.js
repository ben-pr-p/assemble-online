import Sock from './sock'
import Emitter from 'component-emitter'
import isNearEdge from './is-near-edge'

const print = s => {console.log(s); return s}

const Updates = new Emitter()
/*
 * Broadcast updates
 */
Sock.on('update', ([loc, vol, att]) => {
  for (let uid in loc) {
    Updates.emit(`location-${uid}`, loc[uid])
    if (uid == Sock.id)
      myLoc = loc[uid]
  }

  for (let uid in vol) {
    Updates.emit(`volume-${uid}`, vol[uid])
  }

  for (let partnerId in att) {
    console.log(partnerId)
    Updates.emit(`attenuation-for-${partnerId}`, att[partnerId])
  }
})

/*
 * Gooey translate stuff
 */

let myLoc = {}
let translate = {x: 0, y: 0}
let dimensions = {x: window.innerWidth, y: window.innerHeight}
let transitioning = false
let mac = .1

const getMac = () => transitioning ? mac * .01 : mac

Updates.on('location', ({clientX, clientY}) => {
  Sock.emit('location', {
    x: Math.min(Math.max(myLoc.x + ((clientX - translate.x - 50 - myLoc.x) * getMac()), 0), dimensions.x),
    y: Math.min(Math.max(myLoc.y + ((clientY - translate.y - 50 - myLoc.y) * getMac()), 0), dimensions.y)
  })

  setTimeout(() => {
    if (
      isNearEdge(myLoc.x, translate.x, window.innerWidth) ||
      isNearEdge(myLoc.y, translate.y, window.innerHeight)
    ) {
      translate = {
        x: (-1) * myLoc.x + (window.innerWidth / 2) - 50,
        y: (-1) * myLoc.y + (window.innerHeight / 2) - 50
      }

      transitioning = true
      Updates.emit('translate', translate)

      setTimeout(() => transitioning = false, 1500)
    }
  }, 0)
})

Sock.on('dimensions', dims => dimensions = dims)

export default Updates
