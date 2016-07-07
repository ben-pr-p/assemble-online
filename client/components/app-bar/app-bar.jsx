import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import { teal900 } from 'material-ui/styles/colors'

export default class AppBarIconMenu extends React.Component {
  constructor () {
    super()
  }

  editUser () {
    this.props.setEditUserState(true)
  }

  render () {
    const style = {
      backgroundColor: teal900,
      position: 'fixed'
    }

    const titleStyle= {
      color: 'white'
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <AppBar
          className='app-bar'
          style={style}
          titleStyle={titleStyle}
          title='Plaza'
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
      </MuiThemeProvider>
    )
  }
}
