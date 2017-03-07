import { Component, h } from 'preact'
import ListBrowser from '../../../common/list-browser'
import Updates from '../../../lib/updates'

class UserItem extends Component {
  goTo = () => Updates.emit('move-to-user', this.props.item.id)

  render ({item}) {
    return (
      <div className='user-item'>
        <div className='user-avatar'
          style={{'background-image': `url(${item.avatar})`}}
        />
        <div className='user-name'> {item.name} </div>
        <div className='user-bio'> {item.bio} </div>
      </div>
    )
  }
}

export default class UserBrowser extends Component {
  render ({users}) {
    return (
      <ListBrowser
        title='Users'
        items={users}
        ItemDisplay={UserItem}
        close={this.props.close}
      />
    )
  }
}
