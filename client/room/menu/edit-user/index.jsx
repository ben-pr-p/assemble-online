import { Component, h } from 'preact'
import Webcam from 'webcamjs'
import Dialog from '../../../common/dialog'
import Avatar from '../../../common/avatar'
import Button from '../../../common/button'
import TextInput from '../../../common/text-input'
import store from 'store'
import randomString from 'random-string'
import { Bus } from '../../../lib/emitters'
import Sock from '../../../lib/sock'
import IconButton from '../../../common/icon-button'
import { Camera } from '../../../common/icons'

Webcam.set({
  enable_flash: false,
  width: 100,
  height: 100,
  dest_width: 100,
  dest_height: 100,
  crop_width: 100,
  crop_height: 100,
  image_format: 'jpeg',
  jpeg_quality: 70
})

const labelMap = {
  avatar: 'Paste a Image Address to be your Avatar',
  name: 'What\'s your name?'
}

export default class NewUserModal extends Component {
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
    let user = {}
    for (let attr in labelMap) {
      user[attr] = this.state[attr]
    }

    let plaza = document.querySelector('svg#plaza')
    if (plaza && !this.state.name) {
      user.x = plaza.width.baseVal.value / 2,
      user.y = plaza.height.baseVal.value / 2
    }

    store.set('me', user)
    Bus.emit('me', Object.assign(user, {id: Sock.id}))
    this.props.closeModal({shouldSave: 'user'})
  }

  cancel = () =>
    this.props.closeModal({shouldSave: false})

  render () {
    const fields = Object.keys(this.state).map(this.renderField)

    const actions = []

    if (this.state.name != null) {
      actions.push((
        <Button key='cancel' text='Cancel'
          onClick={this.cancel}
        />
      ))
    }

    actions.push((
      <Button className='submit' key='ok' text='Get Started'
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

  startSnapping = () => {
    this.setState({
      snapping: true
    })

    setTimeout(() => {
      Webcam.attach('#preview')
      console.log('Attached preview')
    }, 10)
  }

  snapPic = () => {
    Webcam.snap(data => this.setState({
      avatar: data,
      snapping: false
    }))
  }

  renderField = (attr) => {
    if (attr == 'avatar') {
      return (
        <div className='avatar-field-container' key={attr}>
          {!this.state.snapping
            ? (<Avatar form={true} letters={this.state.name}
                src={this.state.avatar
                      ? this.state.avatar
                      : <Camera />
                    }
                onClick={this.startSnapping}
              />)
            : <div id='preview' onClick={this.snapPic} />
          }
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
