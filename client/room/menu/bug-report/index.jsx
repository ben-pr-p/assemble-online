import { Component, h } from 'preact'
import Dialog from '../../../common/Dialog'
import Button from '../../../common/Button'
import TextInput from '../../../common/text-input'
import request from 'superagent'

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

  onChange = (ev) => this.setState({[ev.target.id]: ev.target.value})

  submit = () => {
    let bug = {}
    for (let attr in this.state) {
      bug[attr] = this.state[attr]
    }

    bug['user-agent'] = navigator.userAgent

    request
    .post('/api/bug-report')
    .send(bug)
    .end((err, res) => {
      this.props.endBugReport()
    })
  }

  cancel = () =>
    this.props.endBugReport()

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    let actions = [(
      <Button key='cancel' text='Cancel'
        onClick={this.cancel.bind(this)}
      />
    ), (
      <Button key='submit' text='Submit Bug/Feature'
        onClick={this.submit.bind(this)}
      />
    )]

    return (
      <Dialog title='Submit a Bug Report or Feature Suggestion'
        actions={actions}
        modal={true}
        open={true}
      >
        <div className='fields-container'>
          {fields}
        </div>
      </Dialog>
    )
  }

  renderField (attr) {
    return (
      <TextInput id={attr} key={attr}
        value={this.state[attr]}
        onChange={this.onChange.bind(this)}
        label={labelMap[attr]}
        className='full-width-text-field'
      />
    )
  }
}
