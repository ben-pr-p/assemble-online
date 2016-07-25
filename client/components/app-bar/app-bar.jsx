import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import { blueGrey400 } from 'material-ui/styles/colors'

export default class AppBarIconMenu extends React.Component {
  constructor () {
    super()
  }

  editUser () {
    this.props.setEditUserState(true)
  }

  render () {
    const { roomName } = this.props

    const style = {
      backgroundColor: blueGrey400,
      position: 'fixed'
    }

    return (
      <AppBar
        className='app-bar'
        style={style}
        title={roomName}
        iconElementLeft={
          <IconButton onClick={this.props.clearLocal} >
            <DeleteIcon />
          </IconButton>
        }
        iconElementRight={
          <IconMenu
            iconButtonElement={ <IconButton><MoreVertIcon /></IconButton> }
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
