import dom from 'component-dom'
import React from 'react'
import { Motion, spring } from 'react-motion'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
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
  {label: 'Agree', name: 'agree'},
  {label: 'Support with Reservations', name: 'reservations'},
  {label: 'Block', name: 'block'}
]

const icons = {
  agree: (<ThumbIcon color={green600} />),
  reservations: (<ThumbIcon color={yellow600} />),
  block: (<BlockIcon color={deepOrange900} />)
}

export default class Announcement extends React.Component {
  constructor () {
    super()

    this.state = {
      hidden: true,
      opaque: true,
      editing: false,
      feedback: false,
      feedOptions: {
        agree: true,
        reservations: true,
        block: true
      }
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

  toggleFeedback () {
    this.setState({
      feedback: !this.state.feedback
    })
  }

  onToggle (ev) {
    const type = dom(ev.nativeEvent.target).attr('data')
    this.state.feedOptions[type] = !this.state.feedOptions[type]
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
    const { editing, feedOptions, feedback } = this.state

    let result = []
    if (editing) {
      result.push(this.renderResponseOptions()),
      result.push(this.renderClearIcon()),
      result.push((<TextField key='input' style={{width: '100%'}} hintText='Type your announcement or question' />)),
      result.push((<IconButton key='save' className='save-icon' onClick={this.saveEdit.bind(this)} ><SaveIcon /></IconButton>))
    } else {
      result.push(this.renderEditIcon()),
      result.push((<span key='text' >{text}</span>))
    }

    for (let o in feedOptions) {
      if (feedback && feedOptions[o]) {
        result.push((
          <div key={o} className='response-option'>
            {icons[o]}
          </div>
        ))
      }
    }

    return result
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

  renderResponseOptions () {
    const {feedback} = this.state

    let options
    if (feedback) {
      const divider = [(<Divider key='divider' />)]
      options = divider.concat(responseOptions.map((o, idx) => (
        <div className='response-option-checkbox' key={idx} >
          <Toggle style={{width: 'auto'}} data={o.name} defaultToggled={true} onToggle={this.onToggle.bind(this)} />
          <div className='label-container' >
            {o.label}
          </div>
          <div className='icon-container'>
            {icons[o.name]}
          </div>
        </div>
      )))
    }

    return (
      <Paper key='drop-down' className='drop-down' >
        <div className='feedback-checkbox' >
          <Toggle style={{width: 'auto'}} defaultToggled={false} onToggle={this.toggleFeedback.bind(this)} />
          <div className='label-container' >
            {'Allow feedback for this announcement/question'}
          </div>
          <div className='icon-container'>
            <FeedbackIcon color='white' />
          </div>
        </div>
        {options}
      </Paper>
    )
  }
}
