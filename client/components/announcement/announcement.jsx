import React from 'react'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import EditIcon from 'material-ui/svg-icons/content/create'
import SaveIcon from 'material-ui/svg-icons/content/save'
import ClearIcon from 'material-ui/svg-icons/content/clear'
import { Motion, spring } from 'react-motion'

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
    this.setState({
      editing: false
    })
  }

  discardEdit () {
    this.setState({
      editing: false
    })
  }

  onMouseOver () {
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
      <div className={`announcement-container ${c_ac}`} onMouseOver={this.onMouseOver.bind(this)} >
        <Motion
          defaultStyle={{opacity: o}}
          style={{opacity: shouldFade ? spring(o, longOpts) : spring(o)}}
        >
          {s =>
            <Paper zDepth={3} className='announcement' style={s} >
              {contents}
            </Paper>
          }
        </Motion>
      </div>
    )
  }

  renderContents () {
    const { text } = this.props
    const { editing } = this.state

    if (editing) {
      return [
        this.renderClearIcon(),
        (<TextField key='input' style={{width: '100%'}} hintText='Type your announcement or question' />),
        (<IconButton key='save' className='save-icon' onClick={this.saveEdit.bind(this)} ><SaveIcon /></IconButton>)
      ]
    } else {
      return [
        this.renderEditIcon(),
        (<span>{text}</span>)
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
}
