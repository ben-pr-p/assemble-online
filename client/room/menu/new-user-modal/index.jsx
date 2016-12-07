import { Component, h } from 'preact'
import Dialog from '../../../common/dialog'
import Avatar from '../../../common/avatar'
import Button from '../../../common/Button'
import TextInput from '../../../common/text-input'
import store from 'store'
import randomString from 'random-string'
import shallowUpdateCompare from '../../../lib/shallow-update-compare'

const labelMap = {
  avatar: 'Paste a Image Address to be your Avatar',
  name: 'What\'s your name?'
}

export default class NewUserModal extends Component {
  state = {
    avatar: '',
    name: '',
    id: null
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowUpdateCompare(this.props, this.state, nextProps, nextState)
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
    let user = {}
    for (let attr in this.state) {
      user[attr] = this.state[attr]
    }

    let plaza = document.querySelector('svg#plaza')
    if (plaza && !this.state.id) {
      user.x = plaza.width.baseVal.value / 2,
      user.y = plaza.height.baseVal.value / 2
    }

    if (!this.state.id)
      user.id = randomString({numeric: false})

    store.set('me', user)
    this.props.closeNewUserModal({shouldSave: true})
  }

  cancel = () =>
    this.props.closeNewUserModal({shouldSave: false})

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    let actions = []
    if (this.state.id) {
      actions.push((
        <Button className='raised' key='cancel' text='Cancel'
          onClick={this.cancel}
        />
      ))
    }

    actions.push((
      <Button key='ok' text='Get Started'
        onClick={this.submit}
      />
    ))

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

  renderField (attr) {
    if (attr == 'avatar') {
      return (
        <div className='avatar-field-container' key={attr}>
          <Avatar form={true} src={this.state.avatar} letters={this.state.name} />
          <TextInput id={attr}
            name={attr}
            value={this.state[attr]}
            onInput={this.onChange}
            label={labelMap[attr]}
          />
        </div>
      )
    } else {
      return (
        <TextInput id={attr} key={attr}
          value={this.state[attr]}
          onInput={this.onChange}
          label={labelMap[attr]}
        />
      )
    }
  }
}
