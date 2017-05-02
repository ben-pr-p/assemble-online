import React, { Component } from 'react'
import { Button, Input, Modal } from 'antd'
import store from 'store'
import { Bus } from '../../../lib/emitters'
import Updates from '../../../lib/updates'

const labelMap = {
  name: 'What would you like to name this checkpoint?',
}

export default class NewCheckpointModal extends Component {
  state = {
    name: '',
  }

  onChange = ev => this.setState({ [ev.target.id]: ev.target.value })

  componentWillMount() {
    if (this.props.checkpoint) {
      Object.assign(this.state, this.props.checkpoint)
    }
  }

  submit = () => {
    const checkpoint = Object.assign({}, this.state)
    Updates.emit('checkpoint-new', checkpoint)
    this.props.close()
  }

  cancel = () => this.props.close()

  render() {
    const fields = Object.keys(this.state).map(this.renderField)

    return (
      <Modal
        title="Create a New Checkpoint"
        visible={true}
        onCancel={this.cancel}
        onOk={this.submit}
        okText="Get Started"
      >
        {fields}
      </Modal>
    )
  }

  renderField = attr => (
    <div key={attr} style={{ margin: 10 }}>
      {labelMap[attr]}
      <Input
        id={attr}
        key={attr}
        value={this.state[attr]}
        onChange={this.onChange}
      />
    </div>
  )
}
