import React, { Component } from 'react'
import Dialog from '../../../common/dialog'
import { Button } from 'antd'
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

  cancel = () =>
    this.props.closeModal({shouldSave: null})

  render () {
    const fields = Object.keys(this.state).map(this.renderField)

    const actions = [
      (<Button key='cancel' text='Cancel' onClick={this.cancel} />),
      (<Button className='submit' key='ok' text='Get Started' onClick={this.submit} />)
    ]

    return (
      <Dialog title='Create a New Checkpoint'
        actions={actions}
      >
        <div className='fields-container'>
          {fields}
        </div>
      </Dialog>
    )
  }

  renderField = (attr) => (
    <TextInput id={attr} key={attr}
      value={this.state[attr]}
      onInput={this.onChange}
      label={labelMap[attr]}
    />
  )
}
