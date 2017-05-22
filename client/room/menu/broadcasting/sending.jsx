import React, { Component } from 'react'
import { Button, Modal } from 'antd'
import Sock from '../../../lib/sock'
import { Bus } from '../../../lib/emitters'
import Operator from '../../operator'

export default class Broadcasting extends Component {
  state = {
    broadcasting: false,
    hasVideo: false
  }

  componentWillMount() {
    Bus.emit('toggle-stream', {
      audio: true,
      video: true
    })
  }

  componentDidMount() {
    this.setPreview()

    Operator.on('update', this.setPreview)
  }

  componentWillUnmount() {
    Operator.off('update', this.setPreview)
  }

  setPreview = () => {
    const stream = Operator.stream.getMine()
    this.preview.srcObject = stream
    this.preview.volume = 0

    const hasVideo = stream && stream.getVideoTracks().length > 0
    this.setState({ hasVideo })
  }

  startBroadcasting = () => this.setState({ broadcasting: true })
  stopBroadcasting = () => this.setState({ broadcasting: false })

  close = () => {
    this.stopBroadcasting()
    this.props.close()
  }

  render() {
    const { broadcasting } = this.state

    const actions = [
      <Button key="exit" onClick={this.close}>Exit</Button>
    ].concat([
      !broadcasting
        ? <Button type="primary" onClick={this.startBroadcasting} key="start">
            Start
          </Button>
        : <Button type="danger" onClick={this.stopBroadcasting} key="stop">
            Stop
          </Button>
    ])

    return (
      <Modal
        title="Broadcast"
        visible={true}
        footer={actions}
        closable={false}
        maskClosable={false}
        style={{ top: 20, left: 20 }}
        width={350}
        mask={false}
        className="broadcast-container"
        wrapClassName="broadcast"
      >

        <div className="broadcast-modal">
          {/* <div
            className="broadcasting-explanation"
            style={{ marginBottom: '3px' }}
          >
            {!broadcasting
              ? <span>
                  Once you click "Start", everyone in the room will only be
                  able to hear you in a window similar to this one. Everyone
                  will lose their connections to each other while you are
                  broadcasting, so use this sparingly!
                </span>
              : <span> You are broadcasting! </span>}
          </div> */}

          <video
            autoPlay
            style={{
              width: '100%',
              transform: 'rotateY(180deg)'
            }}
            ref={el => (this.preview = el)}
          />
        </div>
      </Modal>
    )
  }
}
