import { Component, h } from 'preact'
import WidgetComponents from './widgets'
import { Build, Close } from '../../common/icons'
import Button from '../../common/button'
import Dialog from '../../common/dialog'
import IconButton from '../../common/icon-button'
import wildcardify from 'wildcards'
import { FromPeers } from '../../lib/emitters'
import Sock from '../../lib/sock'

export default class CheckpointDrawer extends Component {
  state = {
    widgetsSelector: false,
    widgets: [],
    tempName: false
  }

  editName = () => this.setState({tempName: this.props.checkpoint.name})
  handleNameInput = ev => this.setState({tempName: ev.target.value})
  onNameInputPress = ev => ev.which == 13
    ? Sock.emit('checkpoint-edit', {id: this.props.checkpoint.id, name: this.state.tempName})
    : ev.which == 27
      ? this.setState({tempName: false})
      : null

  addWidget = widget => this.setState({
    widgets: this.state.widgets.concat([widget])
  })

  wrapAddWidget = kind => ev => {
    this.addWidget(kind)
    this.collapseWidgetDrawer()
  }

  deleteWidget = kind => this.setState({
    widgets: this.state.widgets.filter(w => w.kind != kind)
  })

  deleteModal = () => this.setState({deleteModal: true})
  closeDeleteModal = () => this.setState({deleteModal: false})
  doDelete = () => {
    Sock.emit('checkpoint-destroy', this.props.checkpoint.id)
    this.setState({deleteModal: false})
  }

  openWidgetDrawer = ev => {
    this.setState({widgetsSelector: true})
    setTimeout(() => document.addEventListener('click', this.collapseWidgetDrawer), 1)
  }

  collapseWidgetDrawer = ev => {
    document.removeEventListener('click', this.collapseWidgetDrawer)
    this.setState({widgetsSelector: false})
  }

  componentWillMount () {
    wildcardify(FromPeers, '*', (ev, data) => {
      /*
       * If we currently don't have a widget listener for the event,
       *  - create the proper widget, give it 10 ms to mount, and then re-broadcast
       *    this event
       */
      if (FromPeers.listeners(ev).length == 0) {
        this.setState({
          widgets: this.state.widgets.concat(
            WidgetComponents
            .filter(w => w.kind == ev.split('-')[1])
            .map(w => [w, data])
          )
        })
        setTimeout(() => FromPeers.emit(ev, data), 10)
      }
    })
  }

  render ({checkpoint}, {widgets, widgetsSelector, tempName, deleteModal}) {
    const {name, members} = checkpoint

    return (
      <div className='cp-drawer'>
        {deleteModal && (
          <Dialog title='Are you sure you want to delete the checkpoint?'
            actions={[(
              <Button text='Cancel' onClick={this.closeDeleteModal} />
            ),(
              <Button text='Done' onClick={this.doDelete} />
            )]}
          >
            All of the checkpoints data will be lost forever.
          </Dialog>
        )}

        <div className='cp-title'>
          <IconButton onClick={widgetsSelector ? this.collapseWidgetDrawer : this.openWidgetDrawer}>
            <Build/>
          </IconButton>
          <div className='cp-title-text' onClick={this.editName}>
            {!tempName
              ? name
              : <input value={tempName}
                  onInput={this.handleNameInput}
                  onKeyPress={this.onNameInputPress}
                />
            }
          </div>
          <IconButton style={{marginLeft: 'auto'}} onClick={this.deleteModal}>
            <Close />
          </IconButton>
        </div>

        <div className='cp-body'>
          {widgets.map(w => this.renderWidget(w))}
        </div>

        {widgetsSelector && (
          <div className='cp-widget-drawer'>

            {WidgetComponents.map(wc => (
              <div className='widget-preview' onClick={this.wrapAddWidget(wc)}>
                <div className='widget-square'> {wc.icon} </div>
                <div className='widget-label'> {wc.kind} </div>
              </div>
            ))}

          </div>
        )}

      </div>
    )
  }

  renderWidget = (widget) => {
    return Array.isArray(widget)
      ? this._renderWidget(widget[0], widget[1])
      : this._renderWidget(widget, null)
  }

  _renderWidget = (W, initialState) =>
    <W
      me={this.props.me}
      initialState={initialState}
      members={this.props.checkpoint.members}
      delete={this.deleteWidget}
    />
}
