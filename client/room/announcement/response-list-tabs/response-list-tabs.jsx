import { Component, h } from 'preact'
import {responseOptions, icons} from '../../common/response-options/response-options'

export default class ResponseListTabs extends Component {
  state = {
    selectedTab: null
  }

  render ({responses}) {

    const tabs = responseOptions.map(o => (
      <Tab icon={icons[o.name]}
        className='reason-tabs'
        label={`${o.label} (${responses[o.name].length})`}
        key={o.name} >
        {this.renderResponseList(o.name)}
      </Tab>
    ))

    return (
      <Tabs>
        {tabs}
      </Tabs>
    )
  }

  renderResponseList (type) {
    const {responses} = this.props

    const listItems = responses[type]
      .sort((r1, r2) => r2.date - r1.date)
      .map(r => (
        <ListItem leftAvatar={this.renderAvatar(r.userAvatar, r.userName)}
          primaryText={(r.reason && r.reason != '') ? r.reason : 'No reason specified.'}
          key={r.user}
        />
      ))

    return (
      <List className='list-item-container'>
        {listItems}
      </List>
    )
  }

  renderAvatar (userAvatar, userName) {
    if (userAvatar && userAvatar != '') {
      return (<Avatar src={userAvatar} />)
    }

    if (userName && userName != '') {
      const initials = userName.split(' ').map(n => n.charAt(0).toUpperCase()).join('')
      return (<Avatar>{initials}</Avatar>)
    }

    return (<Avatar />)
  }
}
