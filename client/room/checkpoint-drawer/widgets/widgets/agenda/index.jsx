import React, { Component } from 'react'
import Avatar from '../../../../../common/avatar'
import { Button, Collapse, Input, Tooltip } from 'antd'
import { Agenda, Done, Settings } from '../../../../../common/icons'

const { Panel } = Collapse

/* Notes on agenda items as you're doing them */

export default class AgendaWidget extends Component {
  static icon = (<Agenda style={{ transform: 'scale(2)' }} />)
  static kind = 'Agenda'
  static initial = {
    items: [],
  }

  state = {
    tempItem: {},
    editing: -1
  }

  toggleDone = idx => ev => {
    ev.stopPropagation()
    const copy = this.props.items.slice()
    copy[idx].done = !copy[idx].done
    this.props.update({ items: copy })
  }

  editTempItem = field => ev => this.setState({
    tempItem: Object.assign({}, this.state.tempItem, { [field]: ev.target.value })
  })

  cancelTempItem = () => this.setState({
    tempItem: {}
  })

  clearEditing = () => this.setState({ editing: -1 })

  addItem = () => {
    const toCreate = Object.assign({}, this.state.tempItem)
    this.state.tempItem = {}

    this.props.update({
      items: this.props.items.concat([toCreate])
    })
  }

  editItem = idx => ev => {
    ev.stopPropagation()
    this.setState({
      editing: idx,
      tempItem: Object.assign({}, this.props.items[idx])
    })
  }

  deleteItem = idx => ev => {
    ev.stopPropagation()
    const copy = this.props.items.slice()
    copy.splice(idx, 1)
    this.props.update({ items: copy })
  }

  render () {
    const { items } = this.props
    const { tempItem, editing } = this.state

    const collapseProps = {}
    if (editing > -1) {
      Object.assign(collapseProps, { activeKey: [this.keyify(editing, items[editing])] })
    }

    return (
      <div className='agenda'>
        <Collapse {...collapseProps} onChange={this.clearEditing} >
          {items.map((i, idx) => (
            <Panel key={this.keyify(idx, i)}
              header={(
                <div className='panel-header'>
                  {i.name}

                  <div style={{ display: 'flex' }}>
                    <Tooltip placement='bottom' title={(
                        <div className='item-options'>
                          <Button className='opt' size='small' onClick={this.editItem(idx)}>
                            Edit
                          </Button>
                          <Button className='opt' size='small' onClick={this.deleteItem(idx)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    >
                      <a className='settings' onClick={ev => ev.stopPropagation()}>
                        <Settings />
                      </a>
                    </Tooltip>
                    <a className={`done-btn ${i.done ? 'done' : ''}`} onClick={this.toggleDone(idx)} >
                      <Done />
                    </a>
                  </div>
                </div>
              )}
            >

              {editing == idx
                ? (
                    <div>
                      <Input placeholder='Name' type='text'
                        onChange={this.editTempItem('name')}
                        value={tempItem.name}
                      />
                      <Input placeholder='Description' type='textarea'
                        onChange={this.editTempItem('description')}
                        value={tempItem.description}
                      />
                    </div>
                  )
                : (<p> {i.description} </p>)
              }

              {editing == idx && this.renderButtons()}
            </Panel>
          ))}

          <Panel header='New Item' className='new-agenda-item'>
            <Input placeholder='Name' type='text'
              onChange={this.editTempItem('name')}
              value={tempItem.name}
            />

            <Input placeholder='Description' type='textarea'
              onChange={this.editTempItem('description')}
              value={tempItem.description}
            />

            {this.renderButtons()}
          </Panel>
        </Collapse>
      </div>
    )
  }

  renderButtons = () => (
    <div className='buttons'>
      <Button onClick={this.cancelTempItem}>
        Cancel
      </Button>
      <Button type='primary' onClick={this.addItem}>
        Create
      </Button>
    </div>
  )

  keyify = (idx, obj) => JSON.stringify(Object.assign( { idx }, obj))
}
