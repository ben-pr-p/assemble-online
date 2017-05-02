import React, { Component } from 'react'
import ListBrowser from '../../../common/list-browser'
import Updates from '../../../lib/updates'
import { Card } from 'antd'

class CheckpointItem extends Component {
  goTo = () => Updates.emit('move-to', this.props.item.loc)

  render() {
    const { item } = this.props
    return (
      <Card className="checkpoint-item" onClick={this.goTo}>
        <div
          className="checkpoint-color"
          style={{ backgroundColor: item.color }}
        />
        <div className="checkpoint-label"> {item.name} </div>
      </Card>
    )
  }
}

export default class CheckpointBrowser extends Component {
  render() {
    const { checkpoints } = this.props
    return (
      <ListBrowser
        title="Groups"
        items={checkpoints}
        ItemDisplay={CheckpointItem}
        close={this.props.close}
      />
    )
  }
}
