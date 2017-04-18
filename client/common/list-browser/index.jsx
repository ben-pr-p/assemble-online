import React, { Component } from 'react'
import { Modal } from 'antd'
import IconButton from '../icon-button'
import { Close } from '../icons'

const matches = search => item =>
  Object.keys(item).filter(field =>
    search
      ? typeof item[field] == 'string' && item[field].match(search)
      : true
  ).length > 0

export default class ListBrowser extends Component {
  state = {
    searching: null,
    search: null
  }

  onSearchChange = ev => this.setState({searching: ev.target.value})

  render () {
		const {title, ItemDisplay, items} = this.props
		const {searching, search} = this.state

    const found = items.filter(matches(search))

    return (
      <Modal>
        <div className='list-browser'>
          <div className='title'>
            {title}
            <IconButton onClick={this.props.close}>
              <Close />
            </IconButton>
          </div>

          {searching && (
            <div className='search'>
              <input type='text' onChange={this.onSearchChange} />
            </div>
          )}

          <div className='list-container'>
            {found.map(i => (
              <div className='list-item'>
                <ItemDisplay item={i} />
              </div>
            ))}
          </div>

        </div>
      </Modal>
    )
  }
}
