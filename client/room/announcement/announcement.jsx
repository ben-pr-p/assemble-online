import { Component, h } from 'preact'
import dom from 'component-dom'
import closest from 'component-closest'
import Boss from '../../lib/boss'
import ClearIcon from '../../common/icons/clear'
import FeedbackIcon from '../../common/icons/feedback'
import CommentIcon from '../../common/icons/comment'
import {responseOptions, icons} from '../common/response-options/response-options'
import ResponseListTabs from './response-list-tabs/response-list-tabs'
import shallowUpdateCompare from '../../lib/shallow-update-compare'

export default class Announcement extends Component {
  state = {
    hidden: false,
    opaque: true,
    editing: false,
    feedback: false,
    feedOptions: {
      agree: true,
      reservations: true,
      block: true
    },
    responses: {},
    responseModalShown: false,
    reasonsShown: false,
    text: null,
    authorName: null,
    authorAvatar: null
  }

  prev = {
    feedback: this.state.feedback,
    feedOptions: this.state.feedOptions
  }

  current = null

  shouldComponentUpdate (nextProps, nextState) {
    return shallowUpdateCompare(this.props, this.state, nextProps, nextState)
  }

  componentWillMount () {
    this.state.text = `Welcome to ${this.props.roomName}`
    this.state.authorName = 'System'
    Boss.on('announcement', this.handleAnnouncement.bind(this), 'Announcement')
  }

  componentDidMount () {
    Boss.post('announcement/request')
  }

  componentWillUnmount () {
    Boss.offAllByCaller('Announcement')
  }

  setEdit = () =>
    this.setState({
      editing: true,
      feedback: false
    })

  saveEdit = () => {
    this.current = null
    Boss.post('announcement/mine', {
      text: this.current,
      feedback: this.state.feedback,
      feedOptions: this.state.feedOptions,
      responses: Object.assign(...this.state.feedOptions.map(o => {return {o: []}}))
    })
  }

  handleAnnouncement = (data) => {
    this.prev = {
      feedback: data.feedback,
      feedOptions: data.feedOptions
    }

    this.setState({
      text: data.text,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      feedback: data.feedback,
      feedOptions: data.feedOptions,
      responses: data.responses,
      editing: false,
      hidden: false,
      opaque: true
    })
  }

  handleInputChange = (ev) => this.current = ev.target.value

  discardEdit = () =>
    this.setState({
      editing: false,
      feedback: this.prev.feedback,
      feedOptions: this.prev.feedOptions
    })

  toggleFeedback = () =>
    this.setState({
      feedback: !this.state.feedback
    })

  onToggle = (ev) => {
    const type = dom(ev.nativeEvent.target).attr('data')
    this.state.feedOptions[type] = !this.state.feedOptions[type]
    this.forceUpdate()
  }

  initializeResponse = (ev) => {
    this.responseType = dom(closest(ev.nativeEvent.target, '.response-option')).attr('data')
    this.setState({
      responseModalShown: true
    })
  }

  saveOnEnter = (ev) => (ev.keyCode == 13)
    ? this.saveEdit()
    : null

  respond = (reason) =>
    Boss.post('announcement/response', {
      type: this.responseType,
      reason,
      date: Date.now()
    })

  render ({}, {hidden, opaque, responseModalShown, reasonsShown}) {
    const {shouldFade} = this

    let c_ac = ''
    if (hidden) c_ac = 'hidden'

    const o = opaque ? 1 : .2
    const longOpts = {
      stiffness: 100,
      damping: 100
    }

    const contents = this.renderContents()
    const responseModal = responseModalShown ? this.renderResponseModal() : null
    const reasonModal = reasonsShown ? this.renderReasonModal() : null

    return (
      <div className={`announcement-container ${c_ac}`} >
        <Paper key='main-bar' zDepth={3} className='announcement' >
          {contents}
          {responseModal}
          {reasonModal}
        </Paper>
      </div>
    )
  }

  renderContents () {
    const {text, editing, feedOptions, feedback, responses, authorName, authorAvatar} = this.state

    let result = []
    if (editing) {
      result.push(this.renderResponseOptionSelector()),
      result.push(this.renderClearIcon()),
      result.push((
        <TextField key='input'
          style={{width: '100%'}}
          hintText='Type your announcement or question'
          ref='field' onChange={this.handleInputChange.bind(this)}
          onKeyDown={this.saveOnEnter.bind(this)}
        />
      )),
      result.push((<IconButton key='save' className='save-icon' onClick={this.saveEdit.bind(this)} ><SaveIcon /></IconButton>))
    } else {
      let textContents
      if (feedback)
        textContents = `${authorName} asks: ${text}`
      else
        textContents = `${authorName} says: ${text}`
      result.push(this.renderEditIcon()),
      result.push((<span key='text' >{textContents}</span>))
    }

    for (let o in feedOptions) {
      if (feedback && feedOptions[o]) {
        result.push(this.renderResponseOption(o))
      }
    }

    if (!editing && feedback)
      result.push(this.renderViewReasonsIcon())

    return result
  }

  renderClearIcon () {
    return (
      <IconButton key='left-icon' className='discard-icon' onClick={this.discardEdit.bind(this)} >
        <ClearIcon />
      </IconButton>
    )
  }

  renderEditIcon () {
    return (
      <IconButton key='left-icon' className='edit-icon' onClick={this.setEdit.bind(this)} >
        <EditIcon />
      </IconButton>
    )
  }

  renderViewReasonsIcon () {
    return (
      <IconButton key='view-reasons-icon' className='view-reasons-icon' onClick={this.viewReasons.bind(this)}>
        <CommentIcon />
      </IconButton>
    )
  }

  renderResponseOptionSelector () {
    const {feedback, feedOptions} = this.state

    let cn = 'drop-down '
    let options
    if (feedback) {
      const divider = [(<Divider key='divider' />)]
      options = divider.concat(responseOptions.map((o, idx) => (
        <div className='response-option-checkbox' key={idx} >
          <Toggle style={{width: 'auto'}} data={o.name} toggled={feedOptions[o.name]} onToggle={this.onToggle.bind(this)} />
          <div className='label-container' >
            {o.label}
          </div>
          <div className='icon-container'>
            {icons[o.name]}
          </div>
        </div>
      )))
    } else {
      cn += 'high-margin'
    }

    return (
      <Paper key='drop-down' className={cn} >
        <div className='feedback-checkbox' >
          <Toggle style={{width: 'auto'}} toggled={feedback} onToggle={this.toggleFeedback.bind(this)} />
          <div className='label-container' >
            {'Allow feedback for this announcement/question'}
          </div>
          <div className='icon-container'>
            <FeedbackIcon />
          </div>
        </div>
        {options}
      </Paper>
    )
  }

  renderResponseOption (o) {
    const {responses, editing} = this.state

    if (editing) {
      return (
        <div key={o} className='response-option'>
          {icons[o]}
        </div>
      )
    } else {
      return (
        <div key={o} className='response-option' data={o} >
          <div className='increment-container'>
            {responses[o].length}
          </div>
          <IconButton onClick={this.initializeResponse.bind(this)} >
            {icons[o]}
          </IconButton>
        </div>
      )
    }
  }

  onReasonChange (ev) {
    this.reason = ev.target.value
  }

  closeWithOutReason () {
    this.state.responseModalShown = false
    this.respond(null)
  }

  closeWithReason () {
    this.state.responseModalShown = false
    this.respond(this.reason)
  }

  cancel () {
    this.setState({
      responseModalShown: false
    })
  }

  renderResponseModal () {
    const actions = [
      (<RaisedButton className='cancel'
        key='cancel'
        label='Cancel'
        onClick={this.cancel.bind(this)}/>),
      (<RaisedButton className='no-reason'
        key='no-reason'
        label='No Reason'
        secondary={true}
        onClick={this.closeWithOutReason.bind(this)}/>),
      (<RaisedButton className='submit'
        key='submit'
        label='Submit'
        primary={true}
        onClick={this.closeWithReason.bind(this)}/>)
    ]

    return (
      <Dialog title='Optionally add a reason for your response'
        actions={actions}
        modal={true}
        open={true}
        className='reason-dialog'
      >
        <div>
          <TextField id='reason'
            onChange={this.onReasonChange.bind(this)}
            multiLine={true}
            style={{width: '100%'}}
          />
        </div>
      </Dialog>
    )
  }

  closeReasonModal () {
    this.setState({reasonsShown: false})
  }

  viewReasons () {
    this.setState({
      reasonsShown: true
    })
  }

  renderReasonModal () {
    const {responses} = this.state
    const actions = [(<RaisedButton key='done' label='Done' onClick={this.closeReasonModal.bind(this)} />)]

    return (
      <Dialog title='Reasons'
        actions={actions}
        open={true}
        contentClassName='reason-view-dialog'
      >
        <ResponseListTabs responses={responses} />
      </Dialog>
    )
  }
}
