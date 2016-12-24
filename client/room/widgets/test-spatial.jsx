import { h, Component } from 'preact'

export default class TestSpatial extends Component {
  static spatial = true

  setWidgetState = ev => this.props.update(JSON.parse(this.input.value))

  render ({children, me, update, ...props}) {
    return (
      <div id='widget-state'>
        <span id='current-state'>{JSON.stringify(props)}</span>
        <form>
          <input id='set-state' ref={ref => this.input = ref}/>
          <button id='do-set-state' type='button' onClick={this.setWidgetState} />
        </form>
      </div>
    )
  }
}
