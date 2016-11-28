import { h, Component } from 'preact'
import request from 'superagent'
import EnterIcon from '../common/icons/enter'
import CreateIcon from '../common/icons/create'
import randomString from 'random-string'

const hinttextoptions = [
  'Super Important Meeting',
  'Virtual Intervention for Joshua',
  'City Council Weekly #6',
  'Joshua, You Need Help',
  'Friend Party',
  'Planning the Furry Convention',
  'Joshua, We Can\'t Just Watch While You Ruin Your Life'
]

const encodeName = name =>
  encodeURI(name.replace(/ /g, '-').replace(/[\\.']/g, '').toLowerCase())

export default class Portal extends Component {
  state = {
    rooms: {},
    hintidx: 0,
    newRoomUrl: null,
  }

  updateIntervalId = null

  componentWillMount () {
    this.update()
    this.updateIntervalId = setInterval(this.update, 3000)
    this.hintIntervalId = setInterval(this.cycleHint, 10000)
  }

  update = () =>
    request
    .get('/room-status')
    .query({random: Math.random()})
    .end((err, res) => {
      this.setState({rooms: res.body})
    })

  cycleHint = () =>
    this.setState({
      hintidx: (this.state.hintidx + 1) % hinttextoptions.length
    })

  enterRoom = (room) =>
    () => window.location.pathname = '/room/' + room

  onNewRoomChange = (ev) =>
    this.setState({
      newRoomUrl: encodeName(ev.target.value)
    })

  createAndEnterRoom = () => this.enterRoom(this.state.newRoom ? this.state.newRoom : randomString({numeric: false}))()

  render (props, {rooms, hintidx, newRoomUrl}) {
    return (
      <div className='center-with-padding'>
        <div className='overlay'></div>
        <div className='room-status-container' >
          <span className='big-header'>assemble.live</span>
          <br/>
          <br/>
          <span className='simple-text'>In the future, this will be a secure, real time, audio and text based online meeting platform based on the use and manipulation  of <em>spatial metaphors</em>.</span>
          <br/>
          <br/>
          <span className='simple-text'>For now, please mess around with your friends, report bugs, and suggest features.</span>

          <div className='room-status'>
            <h3>Publicly Joinable Rooms</h3>
            <div className='divider' />
            <div className='room-list-container'>
              {this.renderRooms(rooms)}
            </div>
          </div>
          <div className='divider' />

          <h3>Create Your Own Room</h3>
          <form className='room-form'>
            <label> What would you like to name your room? </label>
            <input placeholder={hinttextoptions[hintidx]}
              onInput={this.onNewRoomChange}
              maxLength='30'
            />
          </form>

          {/* If they're typing in a new room */}
          {(newRoomUrl && newRoomUrl != '') && <span>{`https://www.assemble.live/room/${newRoomUrl}`}</span>}

          <br />
          <br />

          <div className='raised-button' onClick={this.createAndEnterRoom} >
            <CreateIcon />
            <span className='raised-button-text'> Create Room </span>
          </div>

        <br/>
        <br/>
        <span>Want a private room? That's coming soon. If you really want it, <a style={{color: '#80d4ff'}} href='mailto:ben.paul.ryan.packer@gmail.com'>email me</a></span>

        <br/>
        <br/>

        <a href='/blog'>
          <span className='button-label'> Blog/About </span>
        </a>

        </div>
      </div>
    )
  }

  renderRooms = (rooms) => Object.keys(rooms).length != 0
    ? Object.keys(rooms).map(r => (
        <div key={r} className='room-list-item'>
          <div className='enter-icon-container' onClick={this.enterRoom(r)} >
            <EnterIcon className='enter-icon' />
          </div>
          <div className='text-container'>
            <span className='room-name'>{r}</span>
            <br/>
            <span className='room-users'>{`${rooms[r]} active users`}</span>
          </div>
        </div>
      ))
    : (
        <div className='room-list-item'>
          <div className='text-container'>
            <span className='room-name'>No rooms have been created yet.</span>
            <br/>
            <span className='room-users'>Make the first one yourself below! Don't forget to invite friends otherwise it's not fun.</span>
          </div>
        </div>
      )
}
