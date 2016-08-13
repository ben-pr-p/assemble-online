import React from 'react'
import ReactDOM from 'react-dom'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'

class UserCardContents extends React.Component {
  constructor () {
    super()
  }

  render () {
    const {user, pos} = this.props

    const location = {
      left: pos.x,
      top: pos.y
    }

    return (
      <Card styles={location} className='user-card' >
        <CardHeader title={user.name}
          subtitle={user.subtitle || ''}
          avatar={user.avatar} />
        <CardText>{user.bio}</CardText>
      </Card>
    )
  }
}

export default class UserCard extends React.Component {
  constructor () {
  }

  componentDidMount () {
    const {location, user} = this.props

    this.node = document.createElement('div')
    document.body.appendChild(this.node)
    ReactDOM.render(<UserCard location={location} user={user} />, this.node)
  }

  componentWillUnmount () {
    ReactDOM.unmountComponentAtNode(this.node)
    document.body.removeChild(this.node)
  }

  render () {
    React.DOM.noscript()
  }
}
