import { Component, h } from 'preact'
import AgendaItem from './agenda-item'
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
    agenda: []
  }

  componentWillMount () {
    Boss.on('agenda', this.handleAgenda, 'Agenda')
    Boss.on('activeAgendaItem', this.handleAgendaActivity, 'Agenda')
  }

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

  render ({idx}, {editAgendaForm, agenda, activeAgendaItem}) {
    const { closeForm, onDrawerRequestChange, newAgendaForm, setEditAgendaForm, onEditClick } = this

    return (
      <Window idx={idx} title='Agenda'>
        <div className='agenda-container'>
        </div>
      </Window>
    )
  }
}
