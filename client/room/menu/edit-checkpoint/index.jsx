import React, { Component } from 'react'
import { Button, Modal } from 'antd'
import TextInput from '../../../common/text-input'
import store from 'store'
import { Bus } from '../../../lib/emitters'
import Updates from '../../../lib/updates'

const labelMap = {
  name: 'What would you like to name this checkpoint?'
}

export default class NewCheckpointModal extends Component {
  state = {
    name: ''
  }

  onChange = (ev) => this.setState({[ev.target.id]: ev.target.value})

  componentWillMount () {
    if (this.props.checkpoint) {
      Object.assign(this.state, this.props.checkpoint)
    }
  }

  submit = () => {
    const checkpoint = Object.assign({}, this.state)
    Updates.emit('checkpoint-new', checkpoint)
    this.props.closeModal()
  }

  cancel = () => this.props.close()

  render () {
    const fields = Object.keys(this.state).map(this.renderField)

    return (
      <Modal title='Create a New Checkpoint' visible={true}
        onCancel={this.cancel}
        onOk={this.submit} okText='Get Started'
      >
        {fields}
      </Modal>
    )
  }

  renderField = (attr) => (
    <div>
      {labelMap[attr]}
      <TextInput id={attr} key={attr}
        value={this.state[attr]}
        onInput={this.onChange}
      />
    </div>
  )
}
