import { Component, h } from 'preact'
import DoneIcon from '../../../common/icons/done'
import InProgressIcon from '../../../common/icons/in-progress'
import StartIcon from '../../../common/icons/play'
import StopIcon from '../../../common/icons/stop'
import AddIcon from '../../../common/icons/add'
import SaveIcon from '../../../common/icons/save'
import EditIcon from '../../../common/icons/edit'
import ThemeManager from '../../../lib/theme-manager'
import Boss from '../../../lib/boss'

export default class AgendaItem extends Component {
  state = {
    expanded: false,
    editing: false,
    copy: {}
  }

  onTitleChange = (ev) =>
    this.setState({
      copy: Object.assign({...this.state.copy}, {title: ev.target.value})
    })

  onDescriptionChange = (ev) =>
    this.setState({
      copy: Object.assign({...this.state.copy}, {description: ev.target.value})
    })

  editItem = () => this.setState({editing: true})

  saveItem = () =>
    Boss.post(this.state.copy._id ? 'agenda/edit' : 'agenda/new', this.state.copy)

  advance = () => Boss.post('agenda/advance')

  componentWillMount () {
    this.state.editing = this.props.item.order === null
    this.state.copy = Object.assign({}, this.props.item)
  }

  render ({item, status}, {expanded, editing, copy}) {
    return (
      <div className='agenda-item' data={`id-${item._id}`} >
        <div className='number'>
          <div className='agenda-order' >
            {item.order != null
              ? item.order + 1
              : '+'
            }
          </div>
        </div>
        <div className='text'>
          <div className='title'>
            {editing
              ? <input className='agenda-item-input' value={copy.title} onInput={this.onTitleChange} />
              : item.title
            }
          </div>
          <div className='description'>
            {editing
              ? <input className='agenda-item-input' value={copy.description} onInput={this.onDescriptionChange} />
              : item.description
            }
          </div>
        </div>
        <div className='options'>
          {this.renderStatusIcon(status)}
          <div className='icon' onClick={editing ? this.saveItem : this.editItem}>
            {editing ? (copy._id ? <SaveIcon /> : <AddIcon />) : <EditIcon />}
          </div>
        </div>
      </div>
    )
  }

  renderStatusIcon (type) {
    switch (type) {
      case 'complete':
        return (<div className='icon disabled'> <DoneIcon color={ThemeManager.get('green')} /> </div>)
        break

      case 'in-progress':
        return (<div className='icon disabled'> <InProgressIcon color={ThemeManager.get('yellow')} /> </div>)
        break

      case 'start':
        return (<div className='icon' onClick={this.advance} > <StartIcon color={ThemeManager.get('cyan')} /> </div>)
        break

      case 'stop':
        return (<div className='icon' onClick={this.advance} > <StopIcon color={ThemeManager.get('red')} /> </div>)
        break
    }
  }
}
