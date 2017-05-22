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

  componentDidMount() {
    const otherStream = Operator.getOne()
    this.preview.srcObject = otherStream
    this.preview.volume = 1

    const hasVideo = otherStream.getVideoTracks().length > 0
    this.setState({ hasVideo })
  }

  render() {
    const { broadcasting, hasVideo } = this.state

    return (
      <Modal
        title={`Broadcast from ${broadcasting.name}`}
        visible={true}
        footer={null}
        closable={false}
        maskClosable={false}
        style={{ top: 20, left: 20 }}
        width={350}
        mask={false}
        className="broadcast-container"
        wrapClassName="broadcast"
      >
        <div className="broadcast-modal">
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
