import React from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import store from 'store'

const labelMap = {
  name: "What's your name?"
}

export default class NewUserModal extends React.Component {
  constructor () {
    super()
    this.state = {
      name: ''
    }
  }

  onChange (ev) {
    this.state[ev.target.id] = ev.target.value
    this.forceUpdate()
  }

  submit () {
    let user = {}
    for (let attr in this.state) {
      user[attr] = this.state[attr]
    }

    let plaza = document.querySelector('svg#plaza')
    if (plaza) {
      user.x = plaza.width.baseVal.value / 2,
      user.y = plaza.height.baseVal.value / 2
    }

    user.id = Math.random()

    store.set('me', user)
    this.props.closeNewUserModal()
  }

  render () {
    let fields = []
    for (let attr in this.state) {
      fields.push((
        <TextField id={attr} key={attr}
          value={this.state[attr]}
          onChange={this.onChange.bind(this)}
          floatingLabelText={labelMap[attr]}
          floatingLabelFixed={true}
        />
      ))
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
        {fields}
      </Dialog>
    )
  }
}

