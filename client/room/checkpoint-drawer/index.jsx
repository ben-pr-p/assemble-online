import { Component, h } from 'preact'
import WidgetComponents from './widgets'
import { Build } from '../../common/icons'
import IconButton from '../../common/icon-button'
import wildcardify from 'wildcards'
import { FromPeers } from '../../lib/emitters'

export default class CheckpointDrawer extends Component {
  state = {
    drawerOpen: false,
    widgets: []
  }

  addWidget = widget => this.setState({
    widgets: this.state.widgets.concat([widget])
  })

  wrapAddWidget = name => ev => {
    this.addWidget(name)
    this.toggleDrawer()
  }

  toggleDrawer = () => this.setState({drawerOpen: !this.state.drawerOpen})

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

  render ({checkpoint}, {widgets, drawerOpen}) {
    const {name, members} = checkpoint

    return (
      <div className='cp-drawer'>

        <div className='cp-title'>
          <IconButton onClick={this.toggleDrawer}>
            <Build/>
          </IconButton>
          {name}
        </div>

        <div className='cp-body'>
          {widgets.map(w => this.renderWidget(w))}
        </div>

        {drawerOpen && (
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
    <W me={this.props.me} initialState={initialState} members={this.props.checkpoint.members} />
}
