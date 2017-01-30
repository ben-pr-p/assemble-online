import { Component, h } from 'preact'
import WidgetComponents from './widgets'
import { Build } from '../../common/icons'
import IconButton from '../../common/icon-button'

export default class CheckpointDrawer extends Component {
  state = {
    drawerOpen: false,
    widgets: {}
  }

  addWidget = name => this.setState({})
  wrapAddWidget = name => ev => this.addWidget(name)
  toggleDrawer = () => this.setState({drawerOpen: !this.state.drawerOpen})

  render ({checkpoint}, {widgets, drawerOpen}) {
    const {name, members} = checkpoint

    return (
      <div className='cp-drawer'>
        <div className='cp-title'>
          <IconButton onClick={this.toggleDrawer}>
            <Build/>
          </IconButton>
          {name}

          <div className='cp-body'>
            {Object.keys(widgets).map(wn => {
              const Widget = WidgetComponents[wn]
              const props = Object.assign({members}, widgets[wn])
              return <Widget {...props} />
            })}
          </div>
        </div>

        {drawerOpen && (
          <div className='cp-widget-drawer'>

            {WidgetComponents.map(wc => (
              <div className='widget-preview' onClick={this.wrapAddWidget(wc.kind)}>
                <div className='widget-square'>
                  {wc.icon}
                  <div className='widget-label'> {wc.kind} </div>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    )
  }
}
