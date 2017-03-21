import Sock from '../../lib/sock'

const UPDATE_INTERVAL = 100
const AC = window.AudioContext || window.webkitAudioContext

let ac = new AC()

/*
 * Currently takes a fraction (~.35) of a ms - overhead of transferring to web
 * worker is larger
 */

let processor = ac.createScriptProcessor(4096,2,2)
processor.onaudioprocess = (e) => {
  rms = Math.sqrt(e.inputBuffer.getChannelData(0).reduce((a,b) => a + Math.pow(b,2), 0))
}

let inputNode
let rms = 0
let intervalId
let disabled = false

const register = (stream, fn) => {
  if (stream.getAudioTracks().length == 0) {
    disabled = true
    return undefined
  }

  disabled = false
  inputNode = ac.createMediaStreamSource(stream)

  inputNode.connect(processor)
  processor.connect(ac.destination)

  intervalId = window.setInterval(() => {
    fn(rms)
  }, UPDATE_INTERVAL)
}

const detach = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = null

  if (!disabled) {
    inputNode.disconnect(processor)
    processor.disconnect(ac.destination)
  }
}

export default {register, detach}
