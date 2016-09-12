import React from 'react'
import ReactDOM from 'react-dom'
import dragula from 'dragula'
import dom from 'component-dom'
import Avatar from 'material-ui/Avatar'
import Drawer from 'material-ui/Drawer'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import AddBoxIcon from 'material-ui/svg-icons/content/add-box'
import Paper from 'material-ui/Paper'
import AgendaItem from '../agenda-item/agenda-item'

class AgendaDrawer extends React.Component {
  constructor () {
    super()

    /*
    const boundMethods = 'onDrawerRequestChange'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
    */
  }

  componentDidMount () {
    this.destroyDrake()
    this.bindDrake()
  }

  componentWillUnmount () {
    this.destroyDrake()
  }

  bindDrake () {
    const {agenda} = this.props

    this.drake = dragula([dom('.agenda-items-container')[0]], {
      moves: (el, container, handle) => {
        return dom(handle).hasClass('agenda-order')
      }
    })

    this.drake.on('drop', (el, target, source, sibling) => {
      let oldOrder = parseInt(dom(el).attr('data'))
      let newOrder = agenda.length - 1

      if (sibling) {
        newOrder = parseInt(dom(sibling).attr('data')) - 1
      }

      console.log(newOrder)
      this.drake.cancel(true)
    })
  }

  destroyDrake () {
    if (this.drake)
      this.drake.destroy()
  }

  render () {
    const {agenda, onDrawerRequestChange} = this.props

    const agendaEls = []

    if (agenda.length > 0) {
      agendaEls.push(this.renderAgendaItem(agenda[0], 0))
    }

    for (let idx = 1; idx < agenda.length; idx++) {
      agendaEls.push((<Divider key={'divider-' + idx} />))
      agendaEls.push(this.renderAgendaItem(agenda[idx]))
    }

    return (
      <Drawer docked={false}
        openSecondary={true}
        open={true}
        onRequestChange={onDrawerRequestChange}
      >

        <Paper title='Agenda' className='drawer-header' zDepth={2} >
          Agenda
        </Paper>

        <div className='agenda-items-container'>
          {agendaEls}
        </div>

        <Paper title='Agenda' className='drawer-footer' zDepth={2} >
          <RaisedButton onClick={this.props.newAgendaForm}
            primary={true}
            icon={<AddBoxIcon color={this.context.muiTheme.palette.textColor} />}
          />
        </Paper>

      </Drawer>
    )
  }

  renderAgendaItem (item) {
    return (
      <AgendaItem key={item.order} item={item} setEditAgendaForm={this.props.setEditAgendaForm} />
    )
  }
}

AgendaDrawer.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired
}

export default AgendaDrawer
