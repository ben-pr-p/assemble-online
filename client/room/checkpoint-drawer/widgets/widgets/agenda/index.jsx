import React, { Component } from 'react'
import { Button, Collapse, Input, Tooltip } from 'antd'
import Avatar from '../../../../../common/avatar'
import { Agenda, Done, Download, Settings } from '../../../../../common/icons'
import Save from './save'

const { Panel } = Collapse

/* Notes on agenda items as you're doing them */

export default class AgendaWidget extends Component {
  static icon = <Agenda style={{ transform: 'scale(2)' }} />
  static kind = 'Agenda'
  static initial = {
    items: [],
  }

  state = {
    tempItem: {},
    editing: -1,
  }

  save = () => Save(this.props.checkpointName, this.props.items)

  toggleDone = idx => ev => {
    ev.stopPropagation()
    const copy = this.props.items.slice()
    copy[idx].done = !copy[idx].done
    this.props.update({ items: copy })
  }

  editTempItem = field => ev =>
    this.setState({
      tempItem: Object.assign({}, this.state.tempItem, {
        [field]: ev.target.value,
      }),
    })

  cancelTempItem = () =>
    this.setState({
      tempItem: {},
    })

  onPanelChange = nextActivePanel => {
    this.setState({
      editing: -1,
      activePanel: nextActivePanel,
    })
  }

  addItem = () => {
    const toCreate = Object.assign({}, this.state.tempItem)
    this.state.tempItem = {}

    if (this.state.editing > -1) {
      const copy = this.props.items.slice()
      copy[this.state.editing] = toCreate
      this.props.update({ items: copy })

      this.state.editing = -1
    } else {
      this.props.update({
        items: this.props.items.concat([toCreate]),
      })
    }
  }

  editItem = idx => ev => {
    ev.stopPropagation()
    this.setState({
      editing: idx,
      tempItem: Object.assign({}, this.props.items[idx]),
    })
  }

  deleteItem = idx => ev => {
    ev.stopPropagation()
    const copy = this.props.items.slice()
    copy.splice(idx, 1)
    this.props.update({ items: copy })
  }

  onNoteChange = idx => ev => {
    const copy = this.props.items.slice()
    copy[idx] = Object.assign({}, this.props.items[idx], {
      notes: ev.target.value,
    })
    this.props.update({ items: copy })
  }

  render() {
    const { items } = this.props
    const { tempItem, editing, activePanel } = this.state

    const collapseProps = {}
    if (editing > -1) {
      Object.assign(collapseProps, {
        activeKey: [this.keyify(editing, items[editing])],
      })
    }

    return (
      <div className="agenda">
        <Collapse
          {...collapseProps}
          onChange={this.onPanelChange}
          activeKey={activePanel}
        >
          {items.map((i, idx) => (
            <Panel
              key={this.keyify(idx, i)}
              header={
                <div className="panel-header">
                  <div className="panel-header-text-container">
                    {i.name}
                  </div>

                  <div style={{ display: 'flex' }}>
                    <Tooltip
                      placement="bottom"
                      title={
                        <div className="item-options">
                          <Button
                            className="opt"
                            size="small"
                            onClick={this.editItem(idx)}
                          >
                            Edit
                          </Button>
                          <Button
                            className="opt"
                            size="small"
                            onClick={this.deleteItem(idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      }
                    >
                      <a
                        className="settings"
                        onClick={ev => ev.stopPropagation()}
                      >
                        <Settings />
                      </a>
                    </Tooltip>
                    <a
                      className={`done-btn ${i.done ? 'done' : ''}`}
                      onClick={this.toggleDone(idx)}
                    >
                      <Done />
                    </a>
                  </div>
                </div>
              }
            >

              {editing == idx
                ? <div>
                    <Input
                      placeholder="Name"
                      type="text"
                      onChange={this.editTempItem('name')}
                      value={tempItem.name}
                    />
                    <Input
                      placeholder="Description"
                      type="textarea"
                      onChange={this.editTempItem('description')}
                      value={tempItem.description}
                    />
                  </div>
                : <p> {i.description} </p>}

              {editing == idx && this.renderButtons()}

              <h3> Notes </h3>
              <Input
                type="textarea"
                value={i.notes}
                onChange={this.onNoteChange(idx)}
                rows={4}
              />
            </Panel>
          ))}

          <Panel header="New Item" className="new-agenda-item">
            <Input
              placeholder="Name"
              type="text"
              onChange={this.editTempItem('name')}
              value={tempItem.name}
            />

            <Input
              placeholder="Description"
              type="textarea"
              onChange={this.editTempItem('description')}
              value={tempItem.description}
            />

            {this.renderButtons()}
          </Panel>
        </Collapse>
        <Button
          size="small"
          onClick={this.save}
          className="save-button"
        >
          <Download /> Download
        </Button>
      </div>
    )
  }

  renderButtons = () => (
    <div className="buttons">
      <Button onClick={this.cancelTempItem}>
        Reset
      </Button>
      <Button type="primary" onClick={this.addItem}>
        {this.state.editing > -1 ? 'Create' : 'Save'}
      </Button>
    </div>
  )

  keyify = (idx, obj) => idx
}
