const bandwidth = require('./bandwidth')
const audio = true

const video = {
  width: { exact: 320 },
  height: { exact: 200 },
  frameRate: { ideal: 10, max: 15 }
}

const constraints = { audio, video }

const transformSdp = sdp =>
  bandwidth.setVideoBitrates(
    bandwidth.setApplicationSpecificBandwidth(sdp, {
      audio: 30,
      video: 64
    }),
    { min: 64, max: 64 }
  )

module.exports = { constraints, transformSdp }
