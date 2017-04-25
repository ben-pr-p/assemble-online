import React, { Component } from 'react'
import { Button, Input, Modal } from 'antd'
import rq from 'superagent'

const labelMap = {
  user: 'Who are you, and what do you want with assemble.live?',
  problem: 'What problem did you encounter or what feature suggestion do you have?',
  context: 'If this was a bug, what happened to encounter this bug?'
}

export default class BugReport extends Component {
  state = {
    user: '',
    problem: '',
    context: '',
  }

  onChange = (ev) => this.setState({ [ev.target.id]: ev.target.value })

  submit = () => {
    const bug = Object.assign(
      { userAgent: navigator.userAgent },
      this.state
    )

    rq.post('/api/bugs')
      .send(bug)
      .end((err, res) => {
        this.props.close()
      })
  }

  cancel = () => this.props.close()

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    return (
      <Modal title='Submit a Bug Report or Feature Suggestion' visible={true}
        onCancel={this.cancel}
        onOk={this.submit} okText='Submit'
      >
        <div className='fields-container'>
          {fields}
        </div>
      </Modal>
    )
  }

  renderField (attr) {
    return (
      <div key={attr} style={{ margin: 10 }}>
        {labelMap[attr]}
        <Input id={attr} key={attr}
          value={this.state[attr]}
          onChange={this.onChange}
        />
      </div>
    )
  }
}
