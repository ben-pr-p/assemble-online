import React, { Component } from 'react'
import Avatar from '../../../../../common/avatar'
import { Button } from 'antd'
import Sock from '../../../../../lib/sock'
import { Queue } from '../../../../../common/icons'

/* emoji */

export default class QueueWidget extends Component {
  static icon = (<Queue style={{ transform: 'scale(2)' }} />)
  static kind = 'Queue'
  static initial = {
    speaking: null,
    queue: []
  }

  alreadyInQueue = () =>
    (this.props.queue.filter(u => u.id == Sock.id).length > 0)
    ||
    (this.props.speaking && this.props.speaking.id == Sock.id)

  endTurn = () => {
    const copy = this.props.queue.slice()
    const popped = copy.shift() || null
    this.props.update({
      speaking: popped,
      queue: copy
    })
  }

  addMeToQueue = () => {
    if (!this.alreadyInQueue()) {
      const copy = this.props.queue.slice()

      const fullme = Object.assign(this.props.me, { id: Sock.id })
      copy.push(fullme)
      const update = { queue: copy }

      if (this.props.speaking == null)
        this.props.update({ speaking: fullme })
      else
        this.props.update({ queue: copy })
    }
  }

  render () {
    const { speaking, queue, me } = this.props

    return (
      <div className='queue'>
        <div className='speaking-box'>
          <div className='avatar-container'>
            <Avatar form={true} src={speaking ? speaking.avatar : null}
              questionMark={true}
            />
          </div>
          <div className='name-volume-container'>
            <div className='name'>
              {speaking
                ? `${speaking.name}'s turn!`
                : 'No one is speaking!'
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
              type='primary'
            >
              Add Me
            </Button>
          )}
          {(speaking && speaking.id == me.id) && (
            <Button
              type='primary'
              className='queue-button done-speaking'
              onClick={this.endTurn}
            >
              Done
            </Button>
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
