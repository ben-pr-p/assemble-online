import { h, Component } from 'preact'

export default class AgendaItem extends Component {
  render ({editing, item, status}) {
    return (
      <div className='agenda-item'>
        <div className='icons-container'>
          {icons[status]}
        </div>

        <div className='text-container'>
          <div className='agenda-title'>
            {item.title}
          </div>

          <div className='agenda-description'>
            {item.title}
          </div>
        </div>

      </div>
    )
  }
}
