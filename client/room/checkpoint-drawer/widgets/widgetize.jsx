import { h, Component } from 'preact'
import { ToPeers, FromPeers } from '../../../lib/emitters'
import Portal from 'preact-portal'
import IconButton from '../../../common/icon-button'
import GrainIcon from '../../../common/icons/grain'

export default WrappedComponent =>
  class extends Component {
    static kind = WrappedComponent.name
    kind = WrappedComponent.name

    constructor () {
      super()

      this.state = Object.assign({
        owner: null,
      }, WrappedComponent.initial)
    }

    isOwner = () => this.state.owner == this.props.me.id
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
       const mids = members.map(m => m.id)
      this.checkOwnerDeath(mids)
    }

    checkOwnerDeath = mids => {
      if (this.ownerIsDead(mids))
        this.setState({owner: null})

      if (this.isOwner()) {
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
    }

   declareOwnership = () =>
     this.sendToAll({
       owner: this.props.me.id,
       ...this.state
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

    render ({me}, {owner, ...state}) {
      const toPass = Object.assign({
        me: me,
        update: this.update
      }, state)

      return (
        <WrappedComponent {...toPass} />
      )
    }
  }
