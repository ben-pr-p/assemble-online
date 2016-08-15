import React from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import request from 'superagent'

const labelMap = {
  user: 'Who are you, and what do you want with assemble.live?',
  problem: 'What problem did you encounter or what feature suggestion do you have?',
  context: 'If this was a bug, what happened to encounter this bug?'
}

export default class BugReport extends React.Component {
  constructor () {
    super()
    this.state = {
      user: '',
      problem: '',
      context: '',
    }
  }

  onChange (ev) {
    this.state[ev.target.id] = ev.target.value
    this.forceUpdate()
  }

  submit () {
    let bug = {}
    for (let attr in this.state) {
      bug[attr] = this.state[attr]
    }

    bug['user-agent'] = navigator.userAgent
    request
      .post('/bug-report')
      .send(bug)
      .end((err, res) => {
        this.props.endBugReport()
      })
  }

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    let actions = [(
      <RaisedButton key='ok' label='Submit Bug/Feature'
        onClick={this.submit.bind(this)}
      />
    )]

    return (
      <Dialog title='Submit a Bug Report or Feature Suggestion'
        actions={actions}
        modal={true}
        open={true}
        onRequestClose={this.submit.bind(this)}
      >
        <div className='fields-container'>
          {fields}
        </div>
      </Dialog>
    )
  }

  renderField (attr) {
    return (
      <TextField id={attr} key={attr}
        value={this.state[attr]}
        onChange={this.onChange.bind(this)}
        multiLine={true}
        floatingLabelText={labelMap[attr]}
        floatingLabelFixed={true}
        className='full-width-text-field'
      />
    )
  }
}

