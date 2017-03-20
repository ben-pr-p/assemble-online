import Sock from '../../lib/sock'

const UPDATE_INTERVAL = 100
const AC = window.AudioContext || window.webkitAudioContext

let ac
let inputNode
let processor
let rms = 0
let intervalId

const register = (stream, fn) => {
  ac = new AC()
  inputNode = ac.createMediaStreamSource(stream)
  processor = ac.createScriptProcessor(4096,2,2)

  /*
   * Currently takes a fraction (~.35) of a ms - overhead of transferring to web
   * worker is larger
   */

  processor.onaudioprocess = (e) => {
    rms = Math.sqrt(e.inputBuffer.getChannelData(0).reduce((a,b) => a + Math.pow(b,2), 0))
  }

  inputNode.connect(processor)
  processor.connect(ac.destination)

  intervalId = window.setInterval(() => {
    fn(rms)
  }, UPDATE_INTERVAL)
}

const detach = () => {
  if (intervalId) clearInterval(intervalId)

  intervalId = null
  ac = null
  inputNode = null
  processor = null
  rms = null
}

export default {register, detach}
