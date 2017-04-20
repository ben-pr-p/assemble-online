import React, { Component } from 'react'
import { Input, Modal } from 'antd'

const { Search } = Input

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

  onSearchChange = searching => this.setState({ searching })

  render () {
    const { title, ItemDisplay, items } = this.props
    const { searching, search } = this.state

    const found = items.filter(matches(search))

    return (
      <Modal visible={true} title={title} onCancel={this.props.close} >
        <Search onSearch={this.onSearchChange} />

        <div className='list-container'>
          {found.map(i => (
            <div key={i} className='list-item'>
              <ItemDisplay item={i} />
            </div>
          ))}
        </div>

      </Modal>
    )
  }
}
