import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'

export default class AppBarIconMenu extends React.Component {
  constructor () {
    super()
  }

  editUser () {
    this.props.setEditUserState(true)
  }

  render () {
    return (
      <AppBar
        className='app-bar'
        style={{position:'fixed'}}
        title='Title'
        iconElementLeft={<IconButton><NavigationClose /></IconButton>}
        iconElementRight={
          <IconMenu
            iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
            }
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          >
            <MenuItem primaryText='Edit User' onClick={this.editUser.bind(this)} />
          </IconMenu>
        }
      />
    )
  }
}
