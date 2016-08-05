import React from 'react'
import { Motion, spring } from 'react-motion'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import IconButton from 'material-ui/IconButton'
import EditIcon from 'material-ui/svg-icons/content/create'
import SaveIcon from 'material-ui/svg-icons/content/save'
import ClearIcon from 'material-ui/svg-icons/content/clear'
import ThumbIcon from 'material-ui/svg-icons/action/thumb-up'
import BlockIcon from 'material-ui/svg-icons/content/report'
import FeedbackIcon from 'material-ui/svg-icons/action/feedback'
import { green600, yellow600, red600, deepOrange900 } from 'material-ui/styles/colors'

const responseOptions = [
  {label: 'Agree', icon: (<ThumbIcon color={green600} />)},
  {label: 'Support with Reservations', icon: (<ThumbIcon color={yellow600} />)},
  {label: 'Block', icon: (<BlockIcon color={deepOrange900} />)}
]

export default class Announcement extends React.Component {
  constructor () {
    super()
    this.state = {
      hidden: true,
      opaque: true,
      editing: false
    }

    this.shouldFade = true
  }

  componentWillMount () {
    setTimeout(this.flyAndFade.bind(this), 10)
  }

  setEdit () {
    this.setState({
      editing: true
    })
  }

  saveEdit () {
    this.state.editing = false
    this.props.announceMessage()
  }

  discardEdit () {
    this.setState({
      editing: false
    })
  }

  onMouseOver () {
    return
    this.shouldFade = false
    this.setState({opaque: true})
    setTimeout(this.fadeOut.bind(this), 5000)
  }

  flyAndFade () {
    this.flyIn()
    setTimeout(this.fadeOut.bind(this), 5000)
  }

  flyIn () {
    this.setState({hidden: false})
  }

  fadeOut () {
    this.shouldFade = true
    this.setState({opaque: false})
  }

  render () {
    const { hidden, opaque } = this.state
    const { shouldFade } = this

    let c_ac = ''
    if (hidden) c_ac = 'hidden'

    const o = opaque ? 1 : .2
    const longOpts = {
      stiffness: 100,
      damping: 100
    }

    const contents = this.renderContents()

    return (
      <div className={`announcement-container ${c_ac}`} >
        <Paper key='main-bar' zDepth={3} className='announcement' >
          {contents}
        </Paper>
      </div>
    )
  }

  renderContents () {
    const { text } = this.props
    const { editing } = this.state

    if (editing) {
      return [
        this.renderOptionsMenu(),
        this.renderClearIcon(),
        (<TextField key='input' style={{width: '100%'}} hintText='Type your announcement or question' />),
        (<IconButton key='save' className='save-icon' onClick={this.saveEdit.bind(this)} ><SaveIcon /></IconButton>)
      ]
    } else {
      return [
        this.renderEditIcon(),
        (<span key='text' >{text}</span>)
      ]
    }
  }

  renderClearIcon () {
    return (
      <IconButton key='left-icon' className='discard-icon' onClick={this.discardEdit.bind(this)} >
        <ClearIcon color='white' />
      </IconButton>
    )
  }

  renderEditIcon () {
    return (
      <IconButton key='left-icon' className='edit-icon' onClick={this.setEdit.bind(this)} >
        <EditIcon color='white' />
      </IconButton>
    )
  }

  renderOptionsMenu () {
    const options = responseOptions.map((o, idx) => (
      <div className='response-option-checkbox' key={idx} >
        <Toggle style={{width: 'auto'}} defaultToggled={true}/>
        <div className='label-container' >
          {o.label}
        </div>
        <div className='icon-container'>
          {o.icon}
        </div>
      </div>
    ))

    return (
      <Paper key='drop-down' className='drop-down' openImmediately={true} >
        {options}
      </Paper>
    )
  }
}
