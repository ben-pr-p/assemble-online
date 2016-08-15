import React from 'react'
import request from 'superagent'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import customTheme from '../lib/custom-theme.js'
import EnterIcon from 'material-ui/svg-icons/action/open-in-new'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import CreateIcon from 'material-ui/svg-icons/content/add'
import IconButton from 'material-ui/IconButton'

/**
 * TO DO:
  * make descriptions of what it is and how to use it
 */

const hinttextoptions = ['Super Important Meeting', 'Virtual Intervention for Paul', 'City Council Weekly #6', 'Paul, You Need Help']

function encodeName (name) {
  const replacements = [
    [' ', '-'],
    ['\\.', ''],
    ['\'', '']
  ]
  let result = name
  replacements.forEach(r => {
    result = result.replace(new RegExp(r[0], 'g'), r[1])
  })
  return encodeURI(result.toLowerCase())
}

export default class Portal extends React.Component {
  constructor () {
    super()
    this.state = {
      rooms: {},
      hintidx: 0,
      newRoomUrl: null,
    }
    this.updateIntervalId = null
  }

  componentWillMount () {
    this.update()
    this.updateIntervalId = setInterval(this.update.bind(this), 3000)
    this.hintIntervalId = setInterval(this.cycleHint.bind(this), 10000)
  }

  update () {
    request
    .get('/room-status')
    .query({random: Math.random()})
    .end((err, res) => {
      this.setState({rooms: res.body})
    })
  }

  cycleHint () {
    this.setState({
      hintidx: (this.state.hintidx + 1) % hinttextoptions.length
    })
  }

  enterRoom (room) {
    window.location.pathname = '/room/' + room
  }

  onNewRoomChange (ev) {
    this.setState({
      newRoomUrl: encodeName(ev.target.value)
    })
  }

  createAndEnterRoom () {
    this.enterRoom(this.state.newRoomUrl)
  }

  render () {
    const {rooms, hintidx, newRoomUrl} = this.state

    let rs = []
    for (let r in rooms) {
      rs.push((
        <div key={r} className='room-list-item'>
          <Paper circle={true} className='enter-icon-container' zDepth={15}
           onClick={this.enterRoom.bind(this, r)} >
            <EnterIcon className='enter-icon' />
          </Paper>
          <div className='text-container'>
            <span className='room-name'>{r}</span>
            <br/>
            <span className='room-users'>{`${rooms[r]} active users`}</span>
          </div>
        </div>
      ))
    }

    if (rs.length == 0)
      rs = this.renderNoRooms()

    let urlDisplay
    if (newRoomUrl && newRoomUrl != '') {
      urlDisplay = (
        <span>{`htts://www.assemble.live/room/${newRoomUrl}`}</span>
      )
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div className='center-with-padding'>
          <div className='overlay'></div>
          <Paper className='room-status-container' zDepth={10} >

            <div className='room-status'>
              <h3>Publicly Joinable Rooms</h3>
              <Divider />
              <div className='room-list-container'>
                {rs}
              </div>
            </div>
            <Divider />

            <h3>Create Your Own Room</h3>
            <TextField hintText={hinttextoptions[hintidx]}
              floatingLabelText='What would you like to name your room?'
              floatingLabelFixed={true}
              style={{width:'100%'}}
              onChange={this.onNewRoomChange.bind(this)}
              maxLength='30'
              id='room-name-input'
              name='room'
            />

            {urlDisplay}
            <br />
            <br />

            <RaisedButton label='Create'
              labelPosition='before'
              primary={true}
              icon={<CreateIcon />}
              onClick={this.createAndEnterRoom.bind(this)}
            />

          </Paper>
        </div>
      </MuiThemeProvider>
    )
  }

  renderNoRooms () {
    return (
      <ListItem primaryText='No rooms have been created yet.'
        secondaryText='Do so yourself below!' >
      </ListItem>
    )
  }
}
