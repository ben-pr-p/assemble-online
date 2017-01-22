import { Component, h } from 'preact'
import ListBrowser from '../../common/list-browser'
import Updates from '../../lib/updates'

class UserItem extends Component {
  goTo = Updates.emit('')

  render ({item}) {
    return (
      <div className='user-item'>
        <div className='user-avatar'
          style={{'background-image': `url(${user.avatar})`}}
        />
        <div className='user-name'> {item.name} </div>
        <div className='user-bio'> {item.bio} </div>
      </div>
    )
  }
}

export default class CheckpointBrowser extends Component {
  render ({users}) {
    return (
      <ListBrowser
        title='Users'
        items={users}
        ItemDisplay={UserItem}
      />
    )
  }
}
