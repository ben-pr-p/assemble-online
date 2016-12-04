import { Component, h } from 'preact'
import dragula from 'dragula'
import dom from 'component-dom'
import AddIcon from '../../../common/icons/add'
import Button from '../../../common/button'
import AgendaItem from '../agenda-item'
import Boss from '../../../lib/boss'
import theme from '../../../lib/theme-manager'

export default class AgendaDrawer extends Component {
  componentDidMount () {
    this.destroyDrake()
    this.bindDrake()
  }

  componentWillUnmount () {
    this.destroyDrake()
  }

  bindDrake = () => {
    const {agenda} = this.props

    this.drake = dragula([dom('.agenda-items-container')[0]], {
      moves: (el, container, handle) => {
        return dom(handle).hasClass('agenda-order')
      }
    })

    this.drake.on('drop', (el, target, source, sibling) => {
      let item = dom(el).attr('data').split('-')[1]
      let behind

      if (sibling) {
        let data = dom(sibling).attr('data')
        let sib = sibling
        while (!data && sib) {
          sib = sib.nextElementSibling
          if (sib) data = dom(sib).attr('data')
        }

        if (data) behind = data.split('-')[1]
      }

      Boss.post('agenda/reorder', {item, behind})
      this.drake.cancel(true)
    })
  }

  destroyDrake = () => {
    if (this.drake)
      this.drake.destroy()
  }

  render ({agenda, onDrawerRequestChange}, {width, backgroundColor}) {
    const agendaEls = agenda.concat([{
      order: null,
    }]).map(ag => this.renderAgendaItem(ag))

    return (
      <div className='agenda-items-container'>
        {agendaEls}
      </div>
    )
  }

  renderAgendaItem (item) {
    const {activeAgendaItem} = this.props

    const status = activeAgendaItem != null
      ? activeAgendaItem == item.order
        ? item.order == this.props.agenda.length - 1
          ? 'stop'
          : 'in-progress'
        : activeAgendaItem + 1 == item.order
          ? 'start'
          : activeAgendaItem > item.order
            ? 'complete'
            : null
      : null

    return (
      <AgendaItem key={item.order}
        item={item}
        status={status}
      />
    )
  }
}
