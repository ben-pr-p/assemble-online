'use strict'

const React = require('react')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider')
const getMuiTheme = require('material-ui/styles/getMuiTheme')
const customTheme = require('../../client/lib/custom-theme')

class DigestRoot extends React.Component {
  constructor () {
    super()
  }

  render () {
    const agendaItems = this.props.map(i => this.renderAgendaItem(i))

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)} >
        {agendaItems}
      </MuiThemeProvider>
    )
  }

  renderAgendaItem (item) {
    return (
      <div/>
    )
  }
}

module.exports = function generate (data) {
  React.renderToString(<DigestRoot agendaItems={data} />)
}
