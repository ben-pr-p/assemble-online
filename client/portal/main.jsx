import React from 'react'
import request from 'superagent'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import customTheme from '../lib/custom-theme.js'
import EnterIcon from 'material-ui/svg-icons/content/forward'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import CreateIcon from 'material-ui/svg-icons/content/add'

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
        <ListItem key={r} primaryText={r}
          secondaryText={`${rooms[r]} active users`} >
          <RaisedButton label='Enter'
            labelPosition='before'
            secondary={true}
            icon={<EnterIcon />}
            className='button-right'
            onClick={this.enterRoom.bind(this, r)}
          />
        </ListItem>
      ))
    }

    if (rs.length == 0)
      rs = this.renderNoRooms()

    let urlDisplay
    if (newRoomUrl && newRoomUrl != '') {
      urlDisplay = (
        <span>{`Your room will be available at htts://www.assemble.live/room/${newRoomUrl}`}</span>
      )
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div className='center-with-padding'>
          <Paper className='room-status-container'>

            <List className='room-status'>
              <Subheader>Publicly Joinable Rooms</Subheader>
              <Divider />
              {rs}
            </List>
            <Divider />

            <Subheader>Create Your Own Room</Subheader>
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
