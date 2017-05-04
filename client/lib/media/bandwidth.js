/*
 * @author Muaz Khan
 * http://stackoverflow.com/questions/16712224/how-to-control-bandwidth-in-webrtc-video-call
 *
 * Made ES6-ey by Ben Packer
 */

const setBAS = (sdp, { audio, video }) => {
  let transformed = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '')

  if (audio)
    transformed = transformed.replace(
      /a=mid:audio\r\n/g,
      `a=mid:audio\r\nb=AS:${audio}\r\n`
    )
  if (video)
    transformed = transformed.replace(
      /a=mid:video\r\n/g,
      `a=mid:video\r\nb=AS:${video}\r\n`
    )

  return transformed
}

const setApplicationSpecificBandwidth = setBAS

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
const findLine = (sdpLines, prefix, substr) =>
  findLineInRange(sdpLines, 0, -1, prefix, substr)

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
const findLineInRange = (sdpLines, startLine, endLine, prefix, substr) => {
  var realEndLine = endLine !== -1 ? endLine : sdpLines.length

  for (var i = startLine; i < realEndLine; ++i) {
    if (sdpLines[i].indexOf(prefix) === 0) {
      if (
        !substr ||
        sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1
      ) {
        return i
      }
    }
  }
  return null
}

// Gets the codec payload type from an a=rtpmap:X line.
const getCodecPayloadType = sdpLine => {
  var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+')
  var result = sdpLine.match(pattern)
  return result && result.length === 2 ? result[1] : null
}

const setVideoBitrates = (sdp, params) => {
  params = params || {}
  var xgoogle_min_bitrate = params.min
  var xgoogle_max_bitrate = params.max

  var sdpLines = sdp.split('\r\n')

  // VP8
  var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000')
  var vp8Payload
  if (vp8Index) {
    vp8Payload = getCodecPayloadType(sdpLines[vp8Index])
  }

  if (!vp8Payload) {
    return sdp
  }

  var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000')
  var rtxPayload
  if (rtxIndex) {
    rtxPayload = getCodecPayloadType(sdpLines[rtxIndex])
  }

  if (!rtxIndex) {
    return sdp
  }

  var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString())
  if (rtxFmtpLineIndex !== null) {
    var appendrtxNext = '\r\n'
    appendrtxNext +=
      'a=fmtp:' +
      vp8Payload +
      ' x-google-min-bitrate=' +
      (xgoogle_min_bitrate || '228') +
      '; x-google-max-bitrate=' +
      (xgoogle_max_bitrate || '228')
    sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(
      appendrtxNext
    )
    sdp = sdpLines.join('\r\n')
  }

  return sdp
}

const setOpusAttributes = (sdp, params) => {
  params = params || {}

  var sdpLines = sdp.split('\r\n')

  // Opus
  var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000')
  var opusPayload
  if (opusIndex) {
    opusPayload = getCodecPayloadType(sdpLines[opusIndex])
  }

  if (!opusPayload) {
    return sdp
  }

  var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString())
  if (opusFmtpLineIndex === null) {
    return sdp
  }

  var appendOpusNext = ''
  appendOpusNext +=
    '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1')
  appendOpusNext +=
    '; sprop-stereo=' +
    (typeof params['sprop-stereo'] != 'undefined'
      ? params['sprop-stereo']
      : '1')

  if (typeof params.maxaveragebitrate != 'undefined') {
    appendOpusNext +=
      '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8)
  }

  if (typeof params.maxplaybackrate != 'undefined') {
    appendOpusNext +=
      '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8)
  }

  if (typeof params.cbr != 'undefined') {
    appendOpusNext +=
      '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1')
  }

  if (typeof params.useinbandfec != 'undefined') {
    appendOpusNext += '; useinbandfec=' + params.useinbandfec
  }

  if (typeof params.usedtx != 'undefined') {
    appendOpusNext += '; usedtx=' + params.usedtx
  }

  if (typeof params.maxptime != 'undefined') {
    appendOpusNext += '\r\na=maxptime:' + params.maxptime
  }

  sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(
    appendOpusNext
  )

  sdp = sdpLines.join('\r\n')
  return sdp
}

module.exports = {
  setBAS,
  setApplicationSpecificBandwidth,
  setVideoBitrates,
  setOpusAttributes
}
