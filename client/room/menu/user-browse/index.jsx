import React, { Component } from 'react'
import ListBrowser from '../../../common/list-browser'
import Updates from '../../../lib/updates'
import { Card } from 'antd'

class UserItem extends Component {
  goTo = () => Updates.emit('move-to-user', this.props.item.id)

  render() {
    const { item } = this.props

    return (
      <Card className="user-item" onClick={this.goTo}>
        <div
          className="user-avatar"
          style={{ backgroundImage: `url(${item.avatar})` }}
        />
        <div className="user-name"> {item.name} </div>
      </Card>
    )
  }
}

export default class UserBrowser extends Component {
  render() {
    const { users } = this.props
    return (
      <ListBrowser
        title="Users"
        items={users}
        ItemDisplay={UserItem}
        close={this.props.close}
      />
    )
  }
}
