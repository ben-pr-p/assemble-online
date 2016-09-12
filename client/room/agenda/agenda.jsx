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

export default class Agenda extends React.Component {
  constructor () {
    super()
    this.state = {
      current: {
        title: 'Welcome to a good meeting!',
        description: 'You can begin your meeting anytime you\'d like. What happens if this description gets a little bit longer? I do believe everything will just continue to go outwards, which is a bad thing.',
        editAgendaForm: null
      },
      agenda: [],
      drawerOpen: false
    }

    const boundMethods = 'onEditClick onDrawerRequestChange newAgendaForm setEditAgendaForm closeForm handleAgenda'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  componentWillMount () {
    Boss.on('agenda', this.handleAgenda, 'Agenda')
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
    this.setState({
      agenda: agenda
    })
  }

  render () {
    const {roomName} = this.props
    const {current, drawerOpen, editAgendaForm, agenda} = this.state

    let form
    if (editAgendaForm)
      form = (<AgendaItemForm item={editAgendaForm} closeForm={this.closeForm} />)

    let drawer
    if (drawerOpen) {
      drawer = (
        <AgendaDrawer
          onDrawerRequestChange={this.onDrawerRequestChange}
          agenda={agenda}
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

