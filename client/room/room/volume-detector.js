import Boss from '../../lib/boss'

const UPDATE_INTERVAL = 100
const AC = window.AudioContext || window.webkitAudioContext

let ac
let inputNode
let processor
let rms
let intervalId

const register = (stream, myId) => {
  ac = new AC()
  inputNode = ac.createMediaStreamSource(stream)
  processor = ac.createScriptProcessor(4096,2,2)

  processor.onaudioprocess = (e) => {
    rms = Math.sqrt(e.inputBuffer.getChannelData(0).reduce((a,b) => a + Math.pow(b,2), 0))
  }

  inputNode.connect(processor)
  processor.connect(ac.destination)

  intervalId = window.setInterval(() => {
    Boss.post('volume/mine', rms)
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
