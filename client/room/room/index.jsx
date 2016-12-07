import { Component, h } from 'preact'
import Grid from '../grid'
import UserBlob from '../user-blob'
import Boss from '../../lib/boss'
import theme from '../../lib/theme-manager'
import VolumeDetector from './volume-detector'

const UPDATE_INTERVAL = 30

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

export default class Room extends Component {
  state = {
    dimensions: {},
    translate: {x: 0, y: 0},
    localMedia: {audio: true, video: false},
    localStream: null
  }

  mousePos = {}
  intervalId = null

  componentWillMount () {
    window.onresize = this.postScreen

    Boss.on('dimensions', this.handleDimensions, 'Room')
    Boss.on('translate', this.handleTranslate, 'Room')

    this.postScreen()

    this.setStream()
  }

  componentWillUnmount () {
    Boss.offAllByCaller('Room')
    VolumeDetector.detach()
  }

  setStream = () => navigator.getUserMedia(
    this.state.localMedia,
    // on success
    stream => {
      console.log('new stream')
      this.setState({localStream: stream})
      VolumeDetector.register(stream, this.props.me.id)
    },
    // on failure
    error => console.log(error)
  )

  postScreen = () => Boss.post('screen', {x: window.innerWidth, y: window.innerHeight})

  handleDimensions = (data) => this.setState({ dimensions: data })

  handleTranslate = (data) => this.setState({ translate: data })

  onMouseDown = () => {
    if (this.intervalId) clearInterval(this.intervalId)
    this.intervalId = setInterval(this.moveUser, UPDATE_INTERVAL)
  }

  onMouseUp = () => clearInterval(this.intervalId)

  onMouseMove = (ev) =>
    this.mousePos = {
      x: ev.clientX,
      y: ev.clientY
    }

  moveUser = () => Boss.post('location/delta', this.mousePos)

  render ({me, users}, {translate, dimensions, localStream}) {
    const blobs = []
    let idx = 0
    users.forEach((user, uid) => {
      blobs.push((
        <UserBlob user={user}
          idx={idx} key={uid}
          me={me}
          localStream={localStream}
          translate={translate}
          isMe={me ? uid == me.id : false}
        />
      ))
      idx++
    })

    return (
      <div id='plaza'
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <div id='viewport' style={{transform: `translate3d(${translate.x}px, ${translate.y}px, 0px)`}} >
          <Grid dimensions={dimensions} />
          {blobs}
        </div>
      </div>
    )
  }
}
