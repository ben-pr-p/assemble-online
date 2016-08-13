import React from 'react'
import ReactDOM from 'react-dom'
import Portal from './portal/main'
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

window.onload = () => {
  ReactDOM.render(<Portal/>, document.querySelector('#reactAppContainer'))
}
