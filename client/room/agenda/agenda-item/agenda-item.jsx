import React from 'react'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import DoneIcon from 'material-ui/svg-icons/action/done-all'
import InProgressIcon from 'material-ui/svg-icons/notification/sync'
import StartIcon from 'material-ui/svg-icons/av/play-circle-outline'
import StopIcon from 'material-ui/svg-icons/av/stop'
import EditIcon from 'material-ui/svg-icons/content/create'
import {solarized} from '../../../lib/custom-theme'
import Boss from '../../../lib/boss'

export default class AgendaItem extends React.Component {
  constructor () {
    super()
    this.state = {
      expanded: false
    }

    const boundMethods = 'advance editItem'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  editItem () {
    this.props.setEditAgendaForm(this.props.item)
  }

  advance () {
    Boss.post('agenda/advance')
  }

  render () {
    const {item, status} = this.props

    const icon = this.renderStatusIcon(status)

    return (
      <div className='agenda-item' data={`id-${item._id}`} >
        <div className='number'>
          <Avatar size={30} className='agenda-order' >{item.order + 1}</Avatar>
        </div>
        <div className='text'>
          <div className='title'>
            {item.title}
          </div>
          <div className='description'>
            {item.description}
          </div>
        </div>
        <div className='options'>
          {icon}
          <IconButton onClick={this.editItem}> <EditIcon /> </IconButton>
        </div>
      </div>
    )
  }

  renderStatusIcon (type) {
    switch (type) {
      case 'complete':
        return (<IconButton disabled={true} > <DoneIcon color={solarized.green} /> </IconButton>)
        break

      case 'in-progress':
        return (<IconButton disabled={true} > <InProgressIcon color={solarized.yellow} /> </IconButton>)
        break

      case 'start':
        return (<IconButton onClick={this.advance} > <StartIcon color={solarized.cyan} /> </IconButton>)
        break

      case 'stop':
        return (<IconButton onClick={this.advance} > <StopIcon color={solarized.red} /> </IconButton>)
        break
    }
  }
}
