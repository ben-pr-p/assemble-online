import React, { Component } from 'react'
import Webcam from 'webcamjs'
import Avatar from '../../../common/avatar'
import { Button, Input, Modal, Tooltip } from 'antd'
import store from 'store'
import randomString from 'random-string'
import { Bus } from '../../../lib/emitters'
import Sock from '../../../lib/sock'
import IconButton from '../../../common/icon-button'

Webcam.set({
  enable_flash: false,
  width: 140,
  height: 105,
  dest_width: 140,
  dest_height: 105,
  crop_width: 100,
  crop_height: 100,
  image_format: 'jpeg',
  jpeg_quality: 70,
  flip_horiz: true
})

const labelMap = {
  avatar: 'Paste a Image Address to be your Avatar',
  name: 'What\'s your name?'
}

export default class EditUserModal extends Component {
  state = {
    avatar: '',
    name: ''
  }

  onChange = ev => this.setState({ [ev.target.id]: ev.target.value })

  componentWillMount () {
    if (this.props.me) {
      for (let attr in this.state) {
        if (this.props.me[attr])
          this.state[attr] = this.props.me[attr]
      }
    }
  }

  submit = () => {
    const user = Object.assign({
      id: Sock.id,
      audio: true,
      video: false
    }, this.state)

    store.set('me', user)
    Sock.emit('me', user)
    this.props.close({ save: user })
  }

  cancel = () => this.props.close()

  render () {
    const fields = Object.keys(this.state).filter(f => f != 'snapping').map(this.renderField)

    const actions = []

    if (this.state.name != null) {
      actions.push((
        <Button key='cancel' onClick={this.cancel}>
          Cancel
        </Button>
      ))
    }

    actions.push((
      <Button type='primary' key='ok' onClick={this.submit}>
        Get Started
      </Button>
    ))

    return (
      <Modal title='Create a New Profile' footer={actions} visible={true} >
        <div className='fields-container'>
          {fields}
        </div>
      </Modal>
    )
  }

  startSnapping = () => {
    this.setState({
      snapping: true
    })

    setTimeout(() => {
      Webcam.attach('#preview')
    }, 10)
  }

  snapPic = () => {
    Webcam.snap(data => this.setState({
      avatar: data,
      snapping: false
    }))
  }

  renderField = (attr) => {
    if (attr == 'avatar') {
      return (
        <div className='avatar-field-container' key={attr}>
          <Tooltip title='Take a picture' placement='bottom' >
            <div className='avatar-clicker' onClick={this.state.snapping
                ? this.snapPic
                : this.startSnapping
              }
            >
              {!this.state.snapping
                ? (
                    <Avatar form={true} letters={this.state.name}
                      src={this.state.avatar} questionMark={true}
                      onClick={this.startSnapping}
                    />
                  )
                : <div id='preview' onClick={this.snapPic} />
              }
              <Button className='button'
                icon='camera' size='large' type='primary' shape='circle'
              />
            </div>
          </Tooltip>

          <div style={{ marginLeft: 20 }}>
            {labelMap[attr]}
            <Input id={attr}
              name={attr}
              value={this.state[attr]}
              onChange={this.onChange}
            />
          </div>
        </div>
      )
    } else {
      return (
        <div style={{ margin: 10 }} key={attr} >
          {labelMap[attr]}
          <Input id={attr} key={attr}
            value={this.state[attr]}
            onChange={this.onChange}
          />
        </div>
      )
    }
  }
}
