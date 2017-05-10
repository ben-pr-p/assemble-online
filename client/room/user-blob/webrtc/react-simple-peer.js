/* eslint no-console: 0 */

const React = require('react')
const Peer = require('simple-peer')
const { Component } = React
const objHash = require('object-hash')

module.exports = class SimplePeer extends Component {
  constructor() {
    super()
    this.peer = null
    this.temporaryStream = null

    this.bindProps = () => {
      this.onClose = () => {
        this.initialize()
        this.props.onDisconnect()
      }

      this.onData = raw => this.props.onData(JSON.stringify(raw.toString()))

      this.peer.on('error', this.props.onError)
      this.peer.on('signal', this.props.onSignal)
      this.peer.on('stream', this.props.onStream)
      this.peer.on('data', this.onData)
      this.peer.on('connect', this.props.onConnect)
      this.peer.on('close', this.onClose)
    }

    this.unbindProps = () => {
      this.peer.removeListener('error', this.props.onError)
      this.peer.removeListener('signal', this.props.onSignal)
      this.peer.removeListener('stream', this.props.onStream)
      this.peer.removeListener('data', this.onData)
      this.peer.removeListener('connect', this.props.onConnect)
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
      stream: this.stream
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
