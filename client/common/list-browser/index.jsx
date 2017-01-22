import { Component, h } from 'preact'

const matches = search => item =>
  Object.keys(item).filter(field =>
    item[field].match(search)
  ).length > 0

export default class ListBrowser extends Component {
  state = {
    searching: null,
    items: []
  }

  onSearchChange = ev => this.setState({searching: ev.target.value})

  render ({title, ItemDisplay, items}, {searching}) {
    return (
      <Portal into='body'>
        <div className='top-left-modal'>
          <div className='title'>
            {title}
          </div>

          <div className='search'>
            <input type='text' onChange={this.onSearchChange} />
          </div>

          <div className='list-container'>
            {items.filter(matches(searching)).map(i => (
              <div className='list-item'>
                <ItemDisplay item={i} />
              </div>
            ))}
          </div>

        </div>
      </Portal>
    )
  }
}
