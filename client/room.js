import { h, render } from 'preact'
import Main from './room/main'

window.onload = () => {
  render(<Main/>, document.querySelector('#reactAppContainer'))
}

require('preact/devtools')
