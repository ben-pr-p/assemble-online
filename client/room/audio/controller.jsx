import React from 'react'
import ConnectionStatus from '../connection-status/connection-status'
import easyrtcClient from '../../lib/easyrtc'
import dom from 'component-dom'
import io from 'socket.io-client'
import Boss from '../../lib/boss'
import shallowUpdateCompare from '../../lib/shallow-update-compare'
import AudioConnection from './connection'

const UPDATE_INTERVAL = 100

const config = {
  enableAudio: true,
  enableAudioReceive: true,
  enableVideo: false,
  enableVideoReceive: false,
  enableMicrophone: true,
  enableCamera: false
}

export default class AudioController extends React.Component {
  constructor () {
    super()

    this.state = {
      audioStreams: new Map(),
      msg: 'Initializing audio connection to room...'
    }

    this.myAudio = null
    this.easyrtc = window.easyrtc
    this.activeCalls = new Set()

    this.rms = null
    this.rmsIntervalId = null

    window.io = io
    this.registeredStreams = new Set()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowUpdateCompare(this.props, this.state, nextProps, nextState)
  }

  componentWillUnmount () {
    Boss.offAllByCaller('AudioController')
  }

  announceVolume (vol) {
    Boss.post('my-volume', vol)
  }

  componentDidMount () {
    this.initialize()
  }

  onConnectSuccess (easyrtcid) {
    this.props.setEasyRTCId(easyrtcid)
    this.setState({msg: {code: 'conn_sucess', text: `...connected with easyrtcid ${easyrtcid}`}})
  }

  onRoomJoin (roomName) {
    this.setState({msg: {code: 'room_join', text: `...successfully connected to room ${roomName}`}})
  }

  onError (errCode, errMsg) {
    this.setState({msg: `Error ${errCode}: ${errMsg}`})
  }

  onMediaSuccess (stream) {
    this.setState({msg: {code: 'media_success', text: `Successfully retrieved user media` }})
    this.myAudio = stream
    this.initializeAudioContext()
    easyrtc.connect('easyrtc.audioOnly', this.onConnectSuccess.bind(this), this.onError.bind(this))
    easyrtc.joinRoom(this.props.roomName, null, this.onRoomJoin.bind(this), this.onError.bind(this))
  }

  acceptStream (easyrtcid, stream) {
    this.state.audioStreams.set(easyrtcid, stream)
    this.setState({msg: {code: 'audio_from', text: `Now receiving audio from ${easyrtcid}`}})
  }

  onStreamClose (easyrtcid) {
    this.state.audioStreams.delete(easyrtcid)
    easyrtc.hangup(easyrtcid)
    this.activeCalls.delete(easyrtcid)
    this.setState({msg: {code: 'audio_disconnect', text: `${easyrtcid} has disconnected`}})
  }

  onCallSuccess (easyrtcid, mediaType) {
    this.activeCalls.add(easyrtcid)
    this.setState({msg: {code: 'call_success', text: `successfully called ${easyrtcid}`}})
  }

  onCallFailure (easyrtcid, errMsg) {
    this.setState({msg: {code: 'call_failure', text: `failed to established audio connection with ${easyrtcid}: ${errMsg}`}})
  }

  onCallAnswer (wasAccepted, easyrtcid) {
    this.setState({msg: {code: 'call_answer', text: `${easyrtcid} answered and accepted the call`}})
  }

  occupantListener (roomName, occupants) {
    const {easyrtc} = this
    for (let o in occupants) {
      this.setState({msg: {code: 'room_join', text: `${o} has joined the room`}})
      if (easyrtc.myEasyrtcid < o && !this.activeCalls.has(o)) {
        easyrtc.call(o, this.onCallSuccess.bind(this), this.onCallFailure.bind(this), this.onCallAnswer.bind(this))
      }
    }
  }

  shouldAccept (easyrtcid, fn) {
    fn(true)
  }

  initialize () {
    const {easyrtc} = this

    for (let opt in config) easyrtc[opt](config[opt])

    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this))
    easyrtc.setStreamAcceptor(this.acceptStream.bind(this))
    easyrtc.setAcceptChecker(this.shouldAccept.bind(this))
    easyrtc.setOnStreamClosed(this.onStreamClose.bind(this))

    easyrtc.initMediaSource(this.onMediaSuccess.bind(this), this.onError.bind(this))
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

    this.rmsIntervalId = window.setInterval(() => {
      this.announceVolume(this.rms)
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount () {
    const { easyrtc } = this

    if (this.rmsIntervalId) window.clearInterval(this.rmsIntervalId)

    easyrtc.hangupAll()
    easyrtc.disconnect()
  }

  render () {
    const {audioStreams, msg}  = this.state

    let connectionEls = []
    audioStreams.forEach((stream, m) => {
      connectionEls.push((
        <AudioConnection key={m} easyrtcid={m} stream={stream} />
      ))
    })

    return (
      <div className='video-container' style={{height: '0px', width: '0px'}} >
        <ConnectionStatus msg={msg} />
        {connectionEls}
      </div>
    )
  }
}
