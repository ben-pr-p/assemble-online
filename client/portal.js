import React from 'react'
import { render } from 'react-dom'
import Portal from './portal/main'

window.onload = () => {
  render(<Portal />, document.querySelector('#reactAppContainer'))
}
