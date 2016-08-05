import React from 'react'
import ConnectionStatus from './connection-status/connection-status'
import easyrtcClient from '../lib/easyrtc'
import dom from 'component-dom'
import io from 'socket.io-client'

const UPDATE_INTERVAL = 100

export default class AudioController extends React.Component {
  constructor () {
    super()

    this.state = {
      audioStreams: {}, msg: 'Initializing audio connection to room...'
    }

    this.myAudio = null
    this.isConnected = false
    this.easyrtc = window.easyrtc
    this.rms = null
    this.rmsIntervalId = null
    window.io = io
  }

  componentDidMount () {
    this.initialize()
  }

  initialize () {
    const { easyrtc } = this

    easyrtc.enableAudio(true)
    easyrtc.enableAudioReceive(true)
    easyrtc.enableVideo(false)
    easyrtc.enableVideoReceive(false)
    easyrtc.enableMicrophone(true)
    easyrtc.enableCamera(false)

    const onConnectSuccess = (easyrtcid) => {
      this.props.setEasyRTCId(easyrtcid)
      this.setState({msg: {code: 'conn_sucess', text: `...connected with easyrtcid ${easyrtcid}`}})
    }

    const handleError = (errCode, errMsg) => {
      this.setState({msg: `Error ${errCode}: ${errMsg}`})
    }

    const onMediaSuccess = (stream) =>  {
      this.setState({msg: {code: 'media_success', text: `Successfully retrieved user media` }})
      this.myAudio = stream
      this.initializeAudioContext()
      easyrtc.connect('easyrtc.audioOnly', onConnectSuccess, handleError)
    }

    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this))
    easyrtc.setStreamAcceptor(this.acceptStream.bind(this))
    easyrtc.setAcceptChecker(this.shouldAccept.bind(this))

    easyrtc.initMediaSource(onMediaSuccess, handleError)
  }

  acceptStream (easyrtcid, stream) {
    this.state.audioStreams[easyrtcid] = {stream: stream, src: URL.createObjectURL(stream)}
    this.setState({msg: {code: 'audio_from', text: `Now receiving audio from ${easyrtcid}`}})
  }

  onStreamClose (easyrtcid) {
    delete this.state.audioStreams[easyrtcid]
    this.setState({msg: {code: 'audio_disconnect', text: `${easyrtcId} has disconnected`}})
  }

  occupantListener (roomName, occupants) {
    const { easyrtc } = this

    const onCallSuccess = (easyrtcid, mediaType) => {
      this.setState({msg: {code: 'call_success', text: `successfully called ${easyrtcid}`}})
    }

    const onCallFailure = (easyrtcid, errMsg) => {
      this.setState({msg: {code: 'call_failure', text: `failed to established audio connection with ${easyrtcid}: ${errMsg}`}})
    }

    const onCallAnswer = (wasAccepted, easyrtcid) => {
      this.setState({msg: {code: 'call_answer', text: `${easyrtcid} answered and accepted the call`}})
    }

    for (let o in occupants) {
      this.setState({msg: {code: 'room_join', text: `${o} has joined the room`}})
      easyrtc.call(o, onCallSuccess, onCallFailure, onCallAnswer)
    }
  }

  shouldAccept (easyrtcid, fn) {
    fn(true)
  }

  initializeAudioContext () {
    let audioContext = window.AudioContext || window.webkitAudioContext
    this.ac = new audioContext()
    this.inputNode = this.ac.createMediaStreamSource(this.myAudio)
    this.processor = this.ac.createScriptProcessor(4096,2,2)

    this.processor.onaudioprocess = (e) => {
      let sum = e.inputBuffer.getChannelData(0).reduce((a,b) => a + Math.pow(b,2), 0)
      this.rms = Math.sqrt(sum)
    }

    this.inputNode.connect(this.processor)
    this.processor.connect(this.ac.destination)

    this.updateIntervalId = window.setInterval(() => {
      this.props.announceVolume(this.rms)
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount () {
    const { easyrtc } = this

    easyrtc.hangupAll()
    easyrtc.disconnect()
  }

  render () {
    const { audioStreams, msg } = this.state

    let videoEls = []
    for (let m in audioStreams) {
      videoEls.push(<video key={m} data={m} autoplay='' width='0' height='0' />)
    }

    return (
      <div className='video-container' style={{height: '0px', width: '0px'}} >
        <ConnectionStatus msg={msg} />
        {videoEls}
      </div>
    )
  }

  componentDidUpdate () {
    const {easyrtc} = this
    const {audioStreams} = this.state
    const {locations, me, users} = this.props

    const myloc = locations[me.id]
    const uids = Object.keys(users).filter(id => id != me.id)

    let distances = {}

    uids.forEach(uid => {
      let u = locations[uid]
      if (u.x && u.y) {
        distances[u.easyrtcid] = Math.sqrt(Math.pow(myloc.x - u.x, 2) + Math.pow(myloc.y - u.y, 2))
      }
    })

    const videoEls = dom('video')
    videoEls.forEach(el => {
      let mId = dom(el).attr('data')
      if (dom(el).attr('src') == null) {
        easyrtc.setVideoObjectSrc(el, audioStreams[mId].stream)
      }

      let v = Math.min(1 / (Math.pow(distances[mId] - 70, 2) / 5000), 1)
      if (typeof v == 'number' && !isNaN(v)) {
        el.volume = v
      } else {
        console.log('Cannot assign volume %d', v)
        el.volume = 0
      }
    })
  }
}
