import { Component, h } from 'preact'
import AgendaList from './agenda-list'
import Announcement from '../announcement'
import EditIcon from '../../common/icons/edit'
import IconButton from '../../common/icon-button'
import Window from '../../common/window'
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

    return (
      <Window title='Agenda'>
        <div className='agenda-container'>
          {drawerOpen
            ? <AgendaList {...{onDrawerRequestChange, agenda, activeAgendaItem, newAgendaForm, setEditAgendaForm}} />
            : null
          }
        </div>
      </Window>
    )
  }
}
