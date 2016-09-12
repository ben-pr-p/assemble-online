import React from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar'
import store from 'store'
import randomString from 'random-string'
import shallowUpdateCompare from '../../../lib/shallow-update-compare'
import Boss from '../../../lib/boss'

const labelMap = {
  title: 'Title',
  description: 'Description'
}

export default class AgendaItemForm extends React.Component {
  constructor () {
    super()
    this.state = {
      title: '',
      description: '',
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
    if (this.props.item) {
      for (let attr in this.state) {
        if (this.props.item[attr])
          this.state[attr] = this.props.item[attr]
      }
    }
  }

  submit () {
    let item = {}
    for (let attr in this.state) {
      item[attr] = this.state[attr]
    }

    if (typeof this.props.item == 'object') {
      item._id = this.props.item._id
      Boss.post('agenda/edit', item)
    } else {
      Boss.post('agenda/new', item)
    }

    this.props.closeForm()
  }

  cancel () {
    this.props.closeForm()
  }

  render () {
    const {item} = this.props

    let fields = []
    for (let attr in this.state) {
      fields.push((this.renderField(attr)))
    }

    let actions = []
    actions.push((
      <RaisedButton key='cancel' label='Cancel'
        onClick={this.cancel.bind(this)}
      />
    ))

    actions.push((
      <RaisedButton key='ok' label={typeof item == 'object' ? 'Save' : 'Create'}
        onClick={this.submit.bind(this)}
      />
    ))

    return (
      <Dialog title={typeof item == 'object' ? 'Edit your Agenda Item' : 'Create a New Agenda Item'}
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

