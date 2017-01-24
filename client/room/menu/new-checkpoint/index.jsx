import { Component, h } from 'preact'
import Dialog from '../../../common/dialog'
import Button from '../../../common/button'
import TextInput from '../../../common/text-input'
import store from 'store'
import { Bus } from '../../../lib/emitters'
import Updates from '../../../lib/sock'

const labelMap = {
  avatar: 'Paste a Image Address to be your Avatar',
  name: 'What\'s your name?'
}

export default class NewCheckpointModal extends Component {
  state = {
    avatar: '',
    name: ''
  }

  onChange = (ev) => this.setState({[ev.target.id]: ev.target.value})

  componentWillMount () {
    if (this.props.me) {
      for (let attr in this.state) {
        if (this.props.me[attr])
          this.state[attr] = this.props.me[attr]
      }
    }
  }

  submit = () => {
    let checkpoint = {}
    for (let attr in this.state) {
      checkpoint[attr] = this.state[attr]
    }

    Updates.emit('checkpoint-new', checkpoint)
    this.props.closeNewUserModal({shouldSave: true})
  }

  cancel = () =>
    this.props.closeNewUserModal({shouldSave: false})

  render () {
    const fields = Object.keys(this.state).map(this.renderField)

    const actions = [
      (<Button key='cancel' text='Cancel' onClick={this.cancel} />),
      (<Button className='submit' key='ok' text='Get Started' onClick={this.submit} />)
    ]

    return (
      <Dialog title='Create a New Profile'
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
