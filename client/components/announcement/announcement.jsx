import React from 'react'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import ModeEdit from 'material-ui/svg-icons/image/edit'
import { Motion, spring } from 'react-motion'

export default class Announcement extends React.Component {
  constructor () {
    super()
    this.state = {
      hidden: true,
      opaque: true,
      creatingPoll: false
    }

    this.shouldFade = true
  }

  componentWillMount () {
    setTimeout(this.flyAndFade.bind(this), 10)
  }

  togglePoll () {
    this.setState({
      creatingPoll: !this.state.creatingPoll
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
    const { text } = this.props
    const { hidden, opaque } = this.state
    const { shouldFade } = this

    let c_ac = ''
    if (hidden) c_ac = 'hidden'

    const o = opaque ? 1 : .2
    const longOpts = {
      stiffness: 100,
      damping: 100
    }

    return (
      <div className={`announcement-container ${c_ac}`} onMouseOver={this.onMouseOver.bind(this)} >
        <Motion
          defaultStyle={{opacity: o}}
          style={{opacity: shouldFade ? spring(o, longOpts) : spring(o)}}
        >
          {s =>
            <Paper zDepth={3} className='announcement' style={s} >
              <IconButton className='edit-icon' onClick={this.togglePoll.bind(this)} >
                <ModeEdit color='white' />
              </IconButton>
              {text}
            </Paper>
          }
        </Motion>
      </div>
    )
  }
}
