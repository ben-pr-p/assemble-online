import { h, Component } from 'preact'
import { ToPeers, FromPeers } from '../../lib/emitters'
import Boss from '../../lib/boss'

export default WrappedComponent =>
  class extends Component {
    static kind = WrappedComponent.name
    kind = WrappedComponent.name

    state = {
      pos: {x: 100, y: 100},
      size: {x: 300, y: 500}
    }

    isOwner = () => this.state.owner == this.props.me.id
    eventPrefix = () => `widget-${this.kind}`

    componentWillMount () {
      Boss.on('users', users => {
        if (users.filter(([uid, user]) => uid == this.state.owner).length == 0)
          this.setState({owner: null})
      }, this.name)

      FromPeers.on(this.eventPrefix(), stateChange => {
        if (this.isOwner()) this.sendToAll(stateChange)
        this.setState(stateChange)
      })
    }

    componentDidMount () {
      if (!this.state.owner) this.declareOwnership()
    }

    componentWillUnmount () {
      FromPeers.off(this.eventPrefix)
      Boss.offAllByCaller(this.name)
    }

    doMove = () => this.spatial
      ? ToPeers.emit('to-all', {
          event: component.eventPrefix,
          data: {pos: {
            x: this.state.x + ev.movementX,
            y: this.state.y + ev.movementY
          }}
        })
      : this.setState({pos: {
          x: this.state.x + ev.movementX,
          y: this.state.y + ev.movementY
        }})

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

    render ({me}, {pos, size, ...state}) {
      return (
        <WrappedComponent me={me} update={this.update} {...state} />
      )
    }
  }
