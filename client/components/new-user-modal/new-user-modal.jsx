import React from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar'
import store from 'store'
import randomString from 'random-string'

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
      user.id = randomString()

    store.set('me', user)
    this.props.closeNewUserModal()
  }

  render () {
    let fields = []
    for (let attr in this.state) {
      if (attr == 'id') continue
      fields.push((this.renderField(attr)))
    }

    let actions = [(
      <RaisedButton key='ok' label='Get Started'
        onClick={this.submit.bind(this)}
      />
    )]

    return (
      <Dialog title='Create a New Profile'
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
    if (attr == 'avatar') {
      return (
        <div className='avatar-field-container' key={attr}>
          <Avatar src={this.state.avatar} style={{minHeight: '60px', minWidth: '60px'}} />
          <TextField id={attr} 
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

