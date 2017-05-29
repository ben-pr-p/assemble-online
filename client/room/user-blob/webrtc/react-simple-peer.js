/* eslint no-console: 0 */

const React = require('react')
const Peer = require('simple-peer')
const { Component } = React
const objHash = require('object-hash')
const { transformBandwidth } = require('../../../lib/media')

module.exports = class SimplePeer extends Component {
  constructor() {
    super()
    this.peer = null
    this.temporaryStream = null

    this.onError = err => {
      if (this.props.verbose) console.log('Found error: ', err)
      this.props.onError(err)
    }

    this.onSignal = signal => {
      if (this.props.verbose) console.log('Generated signal: ', signal)
      this.props.onSignal(signal)
    }

    this.onStream = stream => {
      if (this.props.verbose) console.log('Got stream: ', stream)
      this.props.onStream(stream)
    }

    this.onData = raw => {
      if (this.props.verbose) console.log('Got data: ', raw)
      this.props.onData(JSON.parse(raw.toString()))
    }

    this.onConnect = connection => {
      if (this.props.verbose) console.log('Connected: ', connection)
      this.props.onConnect(connection)
    }

    this.onClose = closing => {
      if (this.props.verbose) console.log('Closing: ', closing)
      this.props.onClose(closing)
    }

    this.bindProps = () => {
      this.onClose = () => {
        this.initialize()
        this.props.onDisconnect()
      }

      this.peer.on('error', this.onError)
      this.peer.on('signal', this.onSignal)
      this.peer.on('stream', this.onStream)
      this.peer.on('data', this.onData)
      this.peer.on('connect', this.onConnect)
      this.peer.on('close', this.onClose)
    }

    this.unbindProps = () => {
      this.peer.removeListener('error', this.onError)
      this.peer.removeListener('signal', this.onSignal)
      this.peer.removeListener('stream', this.onStream)
      this.peer.removeListener('data', this.onData)
      this.peer.removeListener('connect', this.onConnect)
      this.peer.removeListener('close', this.onClose)
    }

    this.signal = data => this.peer.signal(data)
    this.send = data => this.peer.send(JSON.stringify(data))
  }

  componentWillMount() {
    this.stream = this.props.stream
    this.initialize()
  }

  initialize() {
    if (this.peer) {
      this.unbindProps()
      this.props.onDisconnect()
      this.props.onStream(null)
      this.peer.destroy()
    }

    this.peer = new Peer({
      initiator: this.props.initiator,
      stream: this.stream,
      sdpTransform: transformBandwidth
    })

    this.bindProps()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stream != this.props.stream) {
      this.stream = nextProps.stream
      this.initialize()
    }
  }

  componentWillUnmount() {
    this.peer.destroy()
  }

  render() {
    return null
  }
}
