import { Component, h } from 'preact'
import WidgetComponents from './widgets'

export default class CheckpointDrawer {
  state = {
    open: false,
    widgets: {}
  }

  render ({checkpoint}, {widgets}) {
    const {name, members} = checkpoint

    return (
      <div className='cp-drawer'>
        <div className='cp-title'>
          {name}
          {Object.keys(widgets).map(wn => {
            const Widget = WidgetComponents[wn]
            const props = Object.assign({members}, widgets[wn])
            return <Widget {...props} />
          })}
        </div>
      </div>
    )
  }
}
