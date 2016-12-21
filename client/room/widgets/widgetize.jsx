import { h, Component } from 'preact'
import { ToPeers, FromPeers } from '../../lib/emitters'
import Boss from '../../lib/boss'
import Portal from 'preact-portal'
import IconButton from '../../common/icon-button'
import GrainIcon from '../../common/icons/grain'

const print = string => {console.log(string); return string}

export default WrappedComponent =>
  class extends Component {
    static kind = WrappedComponent.name
    kind = WrappedComponent.name
    spatial = WrappedComponent.spatial

    state = {
      pos: {x: 100, y: 100},
      size: {x: 300, y: 500},
      translate: {x: 0, y: 0},
      dragging: false,
      sizing: false
    }

    isOwner = () => this.state.owner == this.props.me.id
    eventPrefix = () => `widget-${this.kind}`

    componentWillMount () {
      Boss.on('users', users => {
        if (users.filter(([uid, user]) => uid == this.state.owner).length == 0)
          this.setState({owner: null})
      }, this.name)

      Boss.on('translate', this.handleTranslate, this.name)

      FromPeers.on(this.eventPrefix(), stateChange => {
        if (this.isOwner()) this.sendToAll(stateChange)
        this.setState(stateChange)
      })

      this.state.translate = (([x,y]) => ({x, y}))
        (document.querySelector('#viewport')
          .style.transform.match(/[0-9\.]*px,/g)
          .map(s => parseFloat(s)))
    }

    componentDidMount () {
      if (!this.state.owner) this.declareOwnership()
      document.addEventListener('mousemove', this.onMove)
    }

    componentWillUnmount () {
      FromPeers.off(this.eventPrefix)
      Boss.offAllByCaller(this.name)
      document.removeEventListener('mousemove', this.onMove)
    }

    handleTranslate = data => this.setState({ translate: data })
    onDragDown = () => this.setState({dragging: true})
    onDragUp = () => this.setState({dragging: false})
    onSizeDown = () => this.setState({sizing: true})
    onSizeUp = () => this.setState({sizing: false})

    onMove = ev => this.state.dragging
      ? this.doMove(ev)
      : this.state.sizing
        ? this.doSize(ev)
        : null

    doMove = ev => this.spatialUpdate({pos: {
        x: this.state.pos.x + ev.movementX,
        y: this.state.pos.y + ev.movementY
      }})

    doSize = ev => this.spatialUpdate({size: {
        x: this.state.size.x + ev.movementX,
        y: this.state.size.y + ev.movementY
      }})

    spatialUpdate = change => this.spatial
      ? this.update(change)
      : this.setState(change)

   declareOwnership = () =>
     this.sendToAll({
       owner: this.props.me.id
     })

    sendToAll = data =>
      ToPeers.emit(`to-all`, {
        event: this.eventPrefix(),
        data
      })

    update = change =>
      this.isOwner()
        ? this.updateIfBoss(change)
        : !this.state.owner
          ? this.updateIfAnarchy(change)
          : this.updateIfSlave(change)

    updateIfBoss = change => {
      this.setState(change)
      this.sendToAll(change)
    }

    updateIfSlave = change =>
      ToPeers.emit(`to-${this.state.owner}`, {
        event: this.eventPrefix(),
        data: change
      })

    updateIfAnarchy = change =>
      this.updateIfBoss(Object.assign(change, {owner: this.props.me.id}))

    calcTransform = (pos, translate) => this.spatial
      ? `translate(${pos.x + translate.x}px, ${pos.y + translate.y}px)`
      : `translate(${pos.x}px, ${pos.y}px)`

    render ({me}, {pos, size, dragging, translate, ...state}) {
      return (
        <Portal into='body'>
          <div className={`window ${dragging ? 'dragging' : ''}`} style={{
            transform: this.calcTransform(pos, translate),
            width: size.x,
            height: size.y
          }}>
            <div className='window-header'
              onMouseDown={this.onDragDown}
              onMouseUp={this.onDragUp}
            >
              <div className='window-title'>
                {this.kind}
              </div>
            </div>
            <WrappedComponent me={me} update={this.update} {...state} />
            <div onMouseDown={this.onSizeDown} onMouseUp={this.onSizeUp}
              style={{position: 'absolute', bottom: '10px', right: '10px', cursor: 'move'}}
            >
              <GrainIcon />
            </div>
          </div>
        </Portal>
      )
    }
  }
