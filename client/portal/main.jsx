import React, { Component } from 'react'
import { Create, Mail, Github } from '../common/icons'
import IconButton from '../common/icon-button'
import randomString from 'random-string'
import { Button, Input } from 'antd'
import Blog from '../common/blog'

const hinttextoptions = [
  'Super Important Meeting',
  'Virtual Intervention for Joshua',
  'City Council Weekly #6',
  'Joshua, You Need Help',
  'Friend Party',
  'Planning the Furry Convention',
  'Joshua, We Can\'t Just Watch While You Ruin Your Life',
]

const encodeName = name =>
  encodeURI(name.replace(/ /g, '-').replace(/[\\.']/g, '').toLowerCase())

export default class Portal extends Component {
  state = {
    hintidx: 0,
    newRoom: null,
  }

  enterRoom = room => () => (window.location.pathname = '/room/' + room)

  onNewRoomChange = ev =>
    this.setState({
      newRoom: encodeName(ev.target.value),
    })

  createAndEnterRoom = () =>
    this.enterRoom(
      this.state.newRoom ? this.state.newRoom : randomString({ numeric: false })
    )()

  render() {
    const { rooms, hintidx, newRoomUrl } = this.state

    return (
      <div className="page">
        <div className="header-bar">

          <div className="left-side">
            <img
              src="/img/logo.png"
              style={{
                height: '40px',
                width: '40px',
                padding: '10px',
              }}
            />
            <div className="text">
              Assemble
            </div>
          </div>

          <div className="right-side">
            <IconButton
              href="mailto:ben.paul.ryan.packer@gmail.com"
              target="_blank"
            >
              <Mail color="white" />
            </IconButton>
            <IconButton
              href="https://github.com/ben-pr-p/assemble"
              target="_blank"
            >
              <Github />
            </IconButton>
          </div>

        </div>

        <div className="explanation">
          <h3>
            {' '}
            A many party audio and video meeting and decision making platform that's secure, open source, P2P, and a little bit trippy.
            {' '}
          </h3>

          <Blog />
        </div>

        <div className="room-status-container">
          <h3>Create Your Own Room</h3>
          <Input
            label="What would you like to name your room?"
            placeholder={hinttextoptions[hintidx]}
            onChange={this.onNewRoomChange}
            onPressEnter={this.createAndEnterRoom}
            maxLength="30"
          />

          {/* If they're typing in a new room */}
          {newRoomUrl &&
            newRoomUrl != '' &&
            <span>{`https://www.assemble.live/room/${newRoomUrl}`}</span>}
          <br />
          <br />
          <Button type="primary" onClick={this.createAndEnterRoom}>
            Create Room
          </Button>

          <br />
          <br />
          <span>
            {'Questions? This thing works but is not near production level. '}
            <a
              style={{ color: '#80d4ff' }}
              href="mailto:ben.paul.ryan.packer@gmail.com"
            >
              Email me
            </a>
          </span>
          <br />
        </div>
      </div>
    )
  }

  renderRooms = rooms =>
    (Object.keys(rooms).length != 0
      ? Object.keys(rooms).map(r => (
          <div key={r} className="room-list-item">
            <div
              className="enter-icon-container"
              onClick={this.createAndEnterRoom}
            >
              <Enter className="enter-icon" />
            </div>
            <div className="text-container">
              <span className="room-name">{r}</span>
              <br />
              <span className="room-users">{`${rooms[r]} active users`}</span>
            </div>
          </div>
        ))
      : <div className="room-list-item">
          <div className="text-container">
            <span className="room-name">No rooms have been created yet.</span>
            <br />
            <span className="room-users">
              Make the first one yourself below! Don't forget to invite friends otherwise it's not fun.
            </span>
          </div>
        </div>)
}
