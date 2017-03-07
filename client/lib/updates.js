import Sock from './sock'
import Emitter from 'component-emitter'
import isNearEdge from './is-near-edge'

let myLoc = []
let translate = [0, 0]
let needTranslate = true
let dimensions = [window.innerWidth, window.innerHeight]
let transitioning = false
let mac = .1

let width = window.innerWidth
let height = window.innerHeight

const Updates = new Emitter()

/*
 * Broadcast updates
 */
Sock.on('update', ([loc, vol, att]) => {
  for (let uid in loc) {
    Updates.emit(`location-${uid}`, loc[uid])
    if (uid == Sock.id) {
      myLoc = loc[uid]

      if (needTranslate) {
        needTranslate = false
        setTranslate()
      }
    }
  }

  for (let uid in vol) {
    Updates.emit(`volume-${uid}`, vol[uid])
  }

  for (let partnerId in att) {
    Updates.emit(`attenuation-for-${partnerId}`, att[partnerId])
  }
})

Sock.on('dimensions', dims => dimensions = dims)

/*
 * Gooey translate stuff
 */

const third = {
  on: () => width = .6 * window.innerWidth,
  off: () => width = window.innerWidth
}

const getMac = () =>
  transitioning ? mac * .01 : mac

const setTranslate = () => {
  translate = [
    (-1) * myLoc[0] + (width / 2) - 50,
    (-1) * myLoc[1] + (height / 2) - 50
  ]

  transitioning = true
  Updates.emit('translate', translate)
  setTimeout(() => transitioning = false, 2000)
}

Updates.on('location', ([clientX, clientY]) => {
  Sock.emit('location', [
    Math.min(Math.max(myLoc[0] + ((clientX - translate[0] - 50 - myLoc[0]) * getMac()), 0), dimensions[0] - 100),
    Math.min(Math.max(myLoc[1] + ((clientY - translate[1] - 50 - myLoc[1]) * getMac()), 0), dimensions[1] - 100)
  ])

  setTimeout(() => {
    if (
      isNearEdge(myLoc[0] + 50, translate[0], width)
      ||
      isNearEdge(myLoc[1] + 50, translate[1], height)
    )
      setTranslate()
  }, 0)
})

/*
 * Set starting checkpoint location to slight offset of user
 */
Updates.on('checkpoint-new', checkpoint => {
  checkpoint.loc = myLoc.map(num => num + 5)
  Sock.emit('checkpoint-new', checkpoint)
})

Updates.on('move-to', newLoc => {
  Sock.emit('location', newLoc)
  setTimeout(setTranslate, 100)
})

Updates.on('cp-on', third.on)
Updates.on('cp-off', third.off)

export default Updates
