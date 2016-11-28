import { h, render } from 'preact'
import Portal from './portal/main'

window.onload = () => {
  render(<Portal/>, document.querySelector('#reactAppContainer'))
}
