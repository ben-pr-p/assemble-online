import React from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar'
import store from 'store'
import randomString from 'random-string'
import shallowUpdateCompare from '../../lib/shallow-update-compare'
import Boss from '../../lib/boss'

const labelMap = {
  avatar: 'Paste a Image Address to be your Avatar',
  name: 'What\'s your name?'
}

export default class NewUserModal extends React.Component {
  constructor () {
    super()
    this.state = {
      avatar: '',
      name: '',
      id: null
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowUpdateCompare(this.props, this.state, nextProps, nextState)
  }

  onChange (ev) {
    this.state[ev.target.id] = ev.target.value
    this.forceUpdate()
  }

  componentWillMount () {
    if (this.props.me) {
      for (let attr in this.state) {
        if (this.props.me[attr])
          this.state[attr] = this.props.me[attr]
      }
    }
  }

  submit () {
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

  cancel () {
    this.props.closeNewUserModal({shouldSave: false})
  }

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    let actions = []
    if (this.state.id) {
      actions.push((
        <RaisedButton key='cancel' label='Cancel'
          onClick={this.cancel.bind(this)}
        />
      ))
    }

    actions.push((
      <RaisedButton key='ok' label='Get Started'
        onClick={this.submit.bind(this)}
      />
    ))

    return (
      <Dialog title='Create a New Profile'
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
    const {avatar} = this.state

    const goodAvatar = avatar.indexOf('http:') > -1 || avatar.indexOf('data:') > -1

    if (attr == 'avatar') {
      return (
        <div className='avatar-field-container' key={attr}>
          <Avatar src={goodAvatar ? avatar : null} style={{minHeight: '60px', minWidth: '60px'}} />
          <TextField id={attr}
            name={attr}
            value={this.state[attr]}
            onChange={this.onChange.bind(this)}
            floatingLabelText={labelMap[attr]}
            floatingLabelFixed={true}
            className='full-width-text-field'
          />
        </div>
      )
    } else {
      return (
        <TextField id={attr} key={attr}
          value={this.state[attr]}
          onChange={this.onChange.bind(this)}
          floatingLabelText={labelMap[attr]}
          floatingLabelFixed={true}
          className='full-width-text-field'
        />
      )
    }
  }
}

