import React from 'react'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import CompleteIcon from 'material-ui/svg-icons/action/done-all'
import InProgressIcon from 'material-ui/svg-icons/notification/sync'
import NotStartedIcon from 'material-ui/svg-icons/content/redo'
import EditIcon from 'material-ui/svg-icons/content/create'

export default class AgendaItem extends React.Component {
  constructor () {
    super()
    this.state = {
      expanded: false
    }

    const boundMethods = 'markComplete editItem'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  markComplete () {
    this.props.markComplete(this.props.item.id)
  }

  editItem () {
    this.props.editItem(this.props.item.id)
  }

  render () {
    const {item, idx} = this.props

    let icon
    switch (item.status) {
      case 'in-progress':
        icon = (<IconButton onClick={this.markComplete} > <InProgressIcon /> </IconButton>)
        break

      case 'complete':
        icon = (<IconButton > <CompleteIcon /> </IconButton>)
        break

      case 'not-started':
        icon = (<IconButton > <NotStartedIcon /> </IconButton>)
        break
    }

    return (
      <div className='agenda-item' data={idx} >
        <div className='number'>
          <Avatar size={30} className='agenda-order' >{idx + 1}</Avatar>
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
}
