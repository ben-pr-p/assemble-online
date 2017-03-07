import { h, Component } from 'preact'
import { ToPeers, FromPeers } from '../../../lib/emitters'
import Sock from '../../../lib/sock'
import IconButton from '../../../common/icon-button'
import { Close } from '../../../common/icons'

export default WrappedComponent =>
  class extends Component {
    static kind = WrappedComponent.kind
    static icon = WrappedComponent.icon
    kind = WrappedComponent.kind

    constructor () {
      super()

      this.state = Object.assign({
        owner: null,
      }, WrappedComponent.initial)
    }

    isOwner = () => this.state.owner == Sock.id
    eventPrefix = () => `widget-${this.kind}`
    ownerIsDead = mids =>
      mids.filter(mids => mids == this.state.owner).length == 0

    mids = []
    newFriends = mids => {
      const result = mids.filter(m => this.props.me.id != m && !this.mids.includes(m))
      this.mids = result
      return result
    }

    componentWillMount () {
      if (this.props.initialState)
        Object.assign(this.state, this.props.initialState)

      /*
       * If we're owner, share the change with everyone
       */
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
    }

    componentWillReceiveProps ({members}) {
      /*
       * Listen to changes in members for 2 purposes
       * 1) Check and set if the owner is dead
       * 2) See if we are the owner and need to alert new friends about the
       *    existence of this widget
       *
       *    If so, wait until we've received the `connected-to-${partnerId}`
       *    events from the corresponding webrtc components, then broadcast
       *    ourselves as owners
       */
      if (this.isOwner())
        this.tellNewFriends(members)
      else
        this.checkOwnerDeath(members)
    }

    tellNewFriends = mids => {
      const toTell = new Set(this.newFriends(mids))
      if (toTell.size > 0) {
        toTell.forEach(uid =>
          ToPeers.on(`connected-to-${uid}`, () => {
            toTell.delete(uid)
            if (toTell.size == 0) {
              this.declareOwnership()
            }
          })
        )
      }
    }

    checkOwnerDeath = mids => {
      if (this.ownerIsDead(mids))
        this.state.owner = null
    }

   declareOwnership = () => {
     this.state.owner = Sock.id
     this.sendToAll(this.state)
   }

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
      this.sendToAll(change)
      this.setState(change)
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

    suicide = () => this.props.delete(this.kind)

    render ({me}, {owner, ...state}) {
      const toPass = Object.assign({
        me: me,
        update: this.update
      }, state)

      return (
        <div className='widget-border'>
          <div className='widget-header'>
            {this.kind}
            <IconButton onClick={this.suicide}>
              <Close />
            </IconButton>
          </div>
          <WrappedComponent {...toPass} />
        </div>
      )
    }
  }
