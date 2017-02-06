import { Component, h } from 'preact'
import Avatar from '../../../../../common/avatar'
import Button from '../../../../../common/button'
import Sock from '../../../../../lib/sock'

export default class Queue extends Component {
  static initial = {
    speaking: null,
    queue: []
  }

  alreadyInQueue = () =>
    this.props.queue.filter(u => u.id != Sock.id).length > 0 ||
    (this.props.speaking && this.props.speaking.id == Sock.id)

  endTurn = () => {
    const copy = this.props.queue.slice()
    const popped = copy.shift()
    this.props.update({
      speaking: popped,
      queue: copy
    })
  }

  addMeToQueue = () => {
    if (!this.alreadyInQueue()) {
      const copy = this.props.queue.slice()

      const fullme = Object.assign(this.props.me, {id: Sock.id})
      copy.push(fullme)
      const update = {queue: copy}

      if (this.props.speaking == null)
        this.props.update({speaking: fullme})
      else
        this.props.update({queue: copy})
    }
  }

  render ({speaking, queue, me}) {
    return (
      <div className='queue'>
        <div className='speaking-box'>
          <div className='avatar-container'>
            <Avatar form={true} src={speaking ? speaking.avatar : null} />
          </div>
          <div className='name-volume-container'>
            <div className='name'>
              {speaking
                ? `${speaking.name}'s turn!`
                : `No one is speaking!`
              }
            </div>
            <div className='volume'>
              {/* TODO */}
            </div>
          </div>
        </div>

        <div className='buttons-layer'>
          {!this.alreadyInQueue() && (
            <Button
              className='queue-button add-me'
              onClick={this.addMeToQueue}
              text='Add Me'
            />
          )}
          {(speaking && speaking.id == me.id) && (
            <Button
              className='queue-button done-speaking'
              onClick={this.endTurn}
              text='Done'
            />
          )}
        </div>

        <div className='queue-container'>
          {queue.map(u => (
            <div className='queue-item'>
              {u.name}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
