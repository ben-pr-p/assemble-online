import React from 'react'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import EditIcon from 'material-ui/svg-icons/content/create'
import AgendaIcon from 'material-ui/svg-icons/hardware/developer-board'
import MenuItem from 'material-ui/MenuItem'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import AgendaItemForm from './agenda-item-form/agenda-item-form'
import AgendaDrawer from './agenda-drawer/agenda-drawer'
import Announcement from '../announcement/announcement'
import Boss from '../../lib/boss'

const defaultCurrent = {
  title: 'Welcome to a good meeting!',
  description: 'You can begin your meeting anytime you\'d like. Click on the edit button on the right to set your agenda.',
}

const overCurrent = {
  title: 'Hope you had a good meeting!',
  description: 'Check out your digest at TODO',
}

export default class Agenda extends React.Component {
  constructor () {
    super()
    this.state = {
      editAgendaForm: null,
      activeAgendaItem: null,
      agenda: [],
      drawerOpen: false
    }

    const boundMethods = 'onEditClick onDrawerRequestChange newAgendaForm setEditAgendaForm closeForm handleAgenda handleAgendaActivity'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  componentWillMount () {
    Boss.on('agenda', this.handleAgenda, 'Agenda')
    Boss.on('activeAgendaItem', this.handleAgendaActivity, 'Agenda')
  }

  onEditClick () {
    this.setState({
      drawerOpen: !this.state.drawerOpen
    })
  }

  onDrawerRequestChange (open) {
    this.setState({
      drawerOpen: open
    })
  }

  newAgendaForm () {
    this.setState({
      editAgendaForm: true
    })
  }

  setEditAgendaForm (item) {
    this.setState({
      editAgendaForm: item
    })
  }

  closeForm () {
    this.setState({
      editAgendaForm: false
    })
  }

  handleAgenda (agenda) {
    this.setState({agenda})
  }

  handleAgendaActivity (activeAgendaItem) {
    this.setState({activeAgendaItem})
  }

  render () {
    const {roomName} = this.props
    const {drawerOpen, editAgendaForm, agenda, activeAgendaItem} = this.state

    let current
    if (activeAgendaItem != null && activeAgendaItem != -1) {
      if (activeAgendaItem < agenda.length)
        current = agenda[activeAgendaItem]
      else
        current = overCurrent
    } else {
      current = defaultCurrent
    }

    let form
    if (editAgendaForm)
      form = (<AgendaItemForm item={editAgendaForm} closeForm={this.closeForm} />)

    let drawer
    if (drawerOpen) {
      drawer = (
        <AgendaDrawer
          onDrawerRequestChange={this.onDrawerRequestChange}
          agenda={agenda}
          activeAgendaItem={activeAgendaItem}
          newAgendaForm={this.newAgendaForm}
          setEditAgendaForm={this.setEditAgendaForm}
        />
      )
    }

    return (
      <div className='agenda-container'>
        {form}

        <Paper key='main-bar' zDepth={3} className='agenda'>
          <div className='agenda-text'>
            <div className='agenda-title'>{current.title}</div>
            <div className='agenda-description'>{current.description}</div>
          </div>

          <div className='create-icon-container'>
            <IconButton onClick={this.onEditClick} ><EditIcon /></IconButton>
          </div>

          {drawer}
        </Paper>
      </div>
    )
  }
}

