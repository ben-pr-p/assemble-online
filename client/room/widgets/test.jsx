import { h, Component } from 'preact'

export default class Test extends Component {
  setWidgetState = ev => this.props.update(JSON.parse(this.input.value))

  render ({children, me, update, owner, ...props}) {
    console.log(props)
    return (
      <div id='widget-state'
        style={{
          position: 'fixed',
          top: 200,
          left: 200
        }}
      >
        {JSON.stringify(props)}
        <form>
          <input id='set-state' ref={ref => this.input = ref}/>
          <button id='do-set-state' type='button' onClick={this.setWidgetState} />
        </form>
      </div>
    )
  }
}
