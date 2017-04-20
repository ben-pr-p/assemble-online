import React, { Component } from 'react'
import ListBrowser from '../../../common/list-browser'
import Updates from '../../../lib/updates'

class CheckpointItem extends Component {
  goTo = () => Updates.emit('move-to', this.props.item.loc)

  render () {
    const { item } = this.props
    return (
      <div className='checkpoint-item' onClick={this.goTo} >
        <div className='checkpoint-color'
          style={{ backgroundColor: item.color }}
        />
        <div className='checkpoint-label'> {item.name} </div>
      </div>
    )
  }
}

export default class CheckpointBrowser extends Component {
  render () {
    const { checkpoints } = this.props

    return (
      <ListBrowser
        title='Checkpoints'
        items={checkpoints}
        ItemDisplay={CheckpointItem}
        close={this.props.close}
      />
    )
  }
}
