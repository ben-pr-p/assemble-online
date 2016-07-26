import React from 'react'
import ConnectionStatus from './connection-status/connection-status'
import easyrtcClient from '../../node_modules/easyrtc/api/easyrtc'
import io from 'socket.io-client'

export default class AudioController extends React.Component {
  constructor () {
    super()

    this.state = {
      audioStreams: {}, msg: 'Initializing audio connection to room...'
    }

    this.myAudio = null
    this.isConnected = false
    this.easyrtc = window.easyrtc
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
      this.setState({msg: {code: 'conn_sucess', text: `...connected with easyrtcid ${easyrtcid}`}})
    }

    const handleError = (errCode, errMsg) => {
      this.setState({msg: `Error ${errCode}: ${errMsg}`})
    }

    const onMediaSuccess = (stream) =>  {
      this.setState({msg: {code: 'media_success', text: `Successfully retrieved user media` }})
      this.myAudio = stream
      easyrtc.connect('easyrtc.audioOnly', onConnectSuccess, handleError)
    }

    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this))
    easyrtc.setStreamAcceptor(this.acceptStream.bind(this))
    easyrtc.setAcceptChecker(this.shouldAccept.bind(this))

    //navigator.getUserMedia({audio: true}, onMediaSuccess, handleError)
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

  componentWillUnmount () {
    const { easyrtc } = this

    easyrtc.hangupAll()
    easyrtc.disconnect()
  }

  render () {
    const { audioStreams, msg } = this.state

    let audioEls = []
    for (let m in audioStreams) {
      audioEls.push(<audio key={m} src={audioStreams[m].src} />)
    }

    return (
      <div className='audio-container'>
        <ConnectionStatus msg={msg} />
        {audioEls}
      </div>
    )
  }
}
