import React, { Component } from 'react'
import WidgetComponents from './widgets'
import { Close, Left, Grain, Right } from '../../common/icons'
import { Button, Input, Layout, Modal, Tooltip } from 'antd'
import IconButton from '../../common/icon-button'
import wildcardify from 'wildcards'
import { FromPeers } from '../../lib/emitters'
import Sock from '../../lib/sock'

const { Header, Content } = Layout

export default class CheckpointDrawer extends Component {
  state = {
    widgetsSelector: false,
    widgets: [],
    tempName: false,
    collapsed: false,
  }

  editName = () => this.setState({ tempName: this.props.checkpoint.name })
  handleNameInput = ev => this.setState({ tempName: ev.target.value })
  onPressEnter = ev => {
    Sock.emit('checkpoint-edit', {
      id: this.props.checkpoint.id,
      name: this.state.tempName,
    })

    this.setState({ tempName: false })
  }

  onBlur = () => this.setState({ tempName: false })

  addWidget = widget =>
    this.setState({
      widgets: this.state.widgets.concat([widget]),
    })

  wrapAddWidget = kind => ev => {
    this.addWidget(kind)
    this.collapseWidgetDrawer()
  }

  deleteWidget = kind =>
    this.setState({
      widgets: this.state.widgets.filter(w => w.kind != kind),
    })

  deleteModal = () => this.setState({ deleteModal: true })
  closeDeleteModal = () => this.setState({ deleteModal: false })
  doDelete = () => {
    Sock.emit('checkpoint-destroy', this.props.checkpoint.id)
    this.setState({ deleteModal: false })
  }

  openWidgetDrawer = ev => {
    this.setState({ widgetsSelector: true })
    setTimeout(
      () => document.addEventListener('click', this.collapseWidgetDrawer),
      1
    )
  }

  collapseWidgetDrawer = ev => {
    document.removeEventListener('click', this.collapseWidgetDrawer)
    this.setState({ widgetsSelector: false })
  }

  uncollapse = () => this.setState({ collapsed: false })
  collapse = ev => {
    ev.stopPropagation()
    this.setState({ collapsed: true })
  }

  componentWillMount() {
    wildcardify(FromPeers, '*', (ev, data) => {
      /*
       * If we currently don't have a widget listener for the event,
       *  - create the proper widget, give it 10 ms to mount, and then re-broadcast
       *    this event
       */
      if (FromPeers.listeners(ev).length == 0) {
        this.setState({
          widgets: this.state.widgets.concat(
            WidgetComponents.filter(w => w.kind == ev.split('-')[1]).map(w => [
              w,
              data,
            ])
          ),
        })
        setTimeout(() => FromPeers.emit(ev, data), 10)
      }
    })
  }

  render() {
    const { checkpoint } = this.props
    const {
      widgets,
      widgetsSelector,
      tempName,
      deleteModal,
      collapsed,
    } = this.state

    const { name, members } = checkpoint

    if (collapsed) return this.renderCollapsed(checkpoint, widgets)

    return (
      <div className="cp-drawer">
        {deleteModal &&
          <Modal
            title="Are you sure you want to delete the checkpoint?"
            onCancel={this.closeDeleteModal}
            visible={true}
            onOk={this.doDelete}
            okText="Delete"
          >
            All of the checkpoint's data will be lost forever.
          </Modal>}

        <Header className="cp-header">
          <Tooltip placement="bottom" title="Collapse Drawer">
            <IconButton className="cp-header-icon" onClick={this.collapse}>
              <Right />
            </IconButton>
          </Tooltip>
  
          {!tempName
            ? <Tooltip placement="bottomLeft" title="Edit Name">
                <h3 onClick={this.editName}> {name} </h3>
              </Tooltip>
            : <Input
                value={tempName}
                onBlur={this.onBlur}
                onChange={this.handleNameInput}
                onPressEnter={this.onPressEnter}
              />}

          <Tooltip placement="bottom" title="Widgets">
            <IconButton
              className="cp-header-icon"
              onClick={
                widgetsSelector
                  ? this.collapseWidgetDrawer
                  : this.openWidgetDrawer
              }
            >
              <Grain />
            </IconButton>
          </Tooltip>

          <Tooltip placement="bottom" title="Delete Checkpoint">
            <IconButton className="cp-header-icon" onClick={this.deleteModal}>
              <Close />
            </IconButton>
          </Tooltip>
        </Header>

        <Content style={{ padding: 10 }}>
          {widgets.map(w => this.renderWidget(w))}
        </Content>

        {widgetsSelector &&
          <div className="cp-widget-drawer">

            {WidgetComponents.map(wc => (
              <div
                id={wc.kind}
                key={wc.kind}
                className="widget-preview"
                onClick={this.wrapAddWidget(wc)}
              >
                <div className="widget-square"> {wc.icon} </div>
                <div className="widget-label"> {wc.kind} </div>
              </div>
            ))}

          </div>}

      </div>
    )
  }

  renderWidget = widget => {
    return Array.isArray(widget)
      ? this._renderWidget(widget[0], widget[1])
      : this._renderWidget(widget, null)
  }

  _renderWidget = (W, initialState) => (
    <W
      key={W.kind}
      me={this.props.me}
      initialState={initialState}
      members={this.props.checkpoint.members}
      checkpointName={this.props.checkpoint.name}
      delete={this.deleteWidget}
    />
  )

  renderCollapsed = ({ name }, widgets) => (
    <div className="cp-drawer small" onClick={this.uncollapse}>
      <Header className="cp-header">
        <h3> {name} </h3>
      </Header>
      <Content>
        {widgets.map(w => (
          <div className="widget-preview" key={w.kind}>
            <div className="widget-square"> {w.icon} </div>
            <div className="widget-label"> {w.kind} </div>
          </div>
        ))}
      </Content>
    </div>
  )
}
