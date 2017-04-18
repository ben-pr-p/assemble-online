import React from 'react'
import { render } from 'react-dom'
import Main from './room/main'

window.onload = () => {
  render(<Main/>, document.querySelector('#reactAppContainer'))
}
