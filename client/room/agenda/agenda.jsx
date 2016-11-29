import { Component, h } from 'preact'
import AgendaDrawer from './agenda-drawer/agenda-drawer'
import Announcement from '../announcement/announcement'
import EditIcon from '../../common/icons/edit'
import IconButton from '../../common/icon-button'
import Boss from '../../lib/boss'
import theme from '../../lib/theme-manager'

const defaultCurrent = {
  title: 'Welcome!',
  description: 'Set your agenda here',
}

const overCurrent = {
  title: 'Meetings over!',
  description: 'Check out your digest at TODO',
}

export default class Agenda extends Component {
  state = {
    editAgendaForm: null,
    activeAgendaItem: null,
    agenda: [],
    drawerOpen: false
  }

  componentWillMount () {
    Boss.on('agenda', this.handleAgenda, 'Agenda')
    Boss.on('activeAgendaItem', this.handleAgendaActivity, 'Agenda')
  }

  onEditClick = () =>
    this.setState({ drawerOpen: !this.state.drawerOpen })

  onDrawerRequestChange = (open) =>
    this.setState({ drawerOpen: open })

  newAgendaForm = () =>
    this.setState({ editAgendaForm: true })

  setEditAgendaForm = (item) =>
    this.setState({ editAgendaForm: item })

  closeForm = () =>
    this.setState({ editAgendaForm: false })

  handleAgenda = (agenda) =>
    this.setState({agenda})

  handleAgendaActivity = (activeAgendaItem) =>
    this.setState({activeAgendaItem})

  render ({roomName}, {drawerOpen, editAgendaForm, agenda, activeAgendaItem}) {
    const { closeForm, onDrawerRequestChange, newAgendaForm, setEditAgendaForm, onEditClick } = this

    const current = (activeAgendaItem != null && activeAgendaItem != -1)
      ? (activeAgendaItem < agenda.length)
        ? agenda[activeAgendaItem]
        : overCurrent
      : defaultCurrent

    const drawer = drawerOpen
      ? <AgendaDrawer {...{onDrawerRequestChange, agenda, activeAgendaItem, newAgendaForm, setEditAgendaForm}} />
      : null

    return (
      <div className='agenda-container'>
        <div className='agenda'>
          <div className='agenda-text' >
            <div className='agenda-title'>{current.title}</div>
            <div className='agenda-description'>{current.description}</div>
          </div>

          <IconButton className='create-icon-container' onClick={onEditClick} >
            <EditIcon color={theme.get('textColor')} />
          </IconButton>
        </div>
        {drawer}
      </div>
    )
  }
}
