import React from 'react'
import ReactDOM from 'react-dom'
import Blog from './blog/main'
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

window.onload = () => {
  ReactDOM.render(<Blog/>, document.querySelector('#reactAppContainer'))
}
