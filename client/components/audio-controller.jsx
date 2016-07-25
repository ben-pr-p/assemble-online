import React from 'react'
import ConnectionStatus from './connection-status/connection-status'
import clientLib from '../../node_modules/easyrtc/api/easyrtc'

export default class AudioController extends React.Component {
  constructor () {
    super()

    this.state = {
      audioStreams: {},
      msg: null
    }

    this.easyrtc = window.easyrtc
  }

  componentWillMount () {
    this.initialize()
  }

  initialize () {
    const { easyrtc } = this

    this.setState({msg: 'Initializing audio connection to room...'})

    easyrtc.enableAudio(true)
    easyrtc.enableAudioReceive(true)
    easyrtc.enableVideo(false)
    easyrtc.enableVideoReceive(false)
    easyrtc.enableMicrophone(true)
    easyrtc.enableCamera(false)

    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this))

    const onConnectSuccess = (easyrtcid) => {
      this.setState({msg: `...connected with easyrtcid ${easyrtcid}`})
    }

    const handleError = (errCode, errMsg) => {
      this.setState({msg: `Error ${errCode}: ${errMsg}`})
    }

    const onMediaSuccess = () =>  {
      this.setState({msg: `Successfully retrieved user media`})
      easyrtc.connect('easyrtc.audioOnly', onConnectSuccess, handleError)
    }

    easyrtc.initMediaSource(onMediaSuccess, handleError)

    easyrtc.setStreamAcceptor(this.acceptStream.bind(this))
  }

  acceptStream (easyrtcid, stream) {
    this.state.audioStreams.push(stream)
    this.setState({msg: `Now receiving audio from ${easyrtcid}`})
  }

  onStreamClose (easyrtcid) {
    delete this.state.audioStreams[easyrtcid]
    this.setState({msg: `${easyrtcId} has disconnected`})
  }

  occupantListener (roomName, occupantList) {
    for (let o in occupantList) {
      this.setState({msg: `${o} has joined the room`})
    }
  }

  componentWillUnmount () {
    easyrtc.hangupAll()
    easyrtc.disconnect()
  }

  render () {
    const { audioStreams, msg } = this.state

    let audioEls = []
    for (let m in audioStreams) {
      audioEls.push(<audio key={m} src={URL.createObjectUrl(audioStreams[m])} />)
    }

    return (
      <div className='audio-container'>
        <ConnectionStatus msg={msg} />
        {audioEls}
      </div>
    )
  }
}
