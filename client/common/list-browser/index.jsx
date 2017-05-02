import React, { Component } from 'react'
import { Input, Modal } from 'antd'

const { Search } = Input

const matches = search => item =>
  Object.keys(item).filter(
    field =>
      (search
        ? typeof item[field] == 'string' &&
            !['avatar', 'id'].includes(field) &&
            item[field].match(search)
        : false)
  ).length > 0 ||
  (!search || search.length == 0)

export default class ListBrowser extends Component {
  state = {
    searching: null,
    search: null,
  }

  onSearchChange = search => this.setState({ search })

  render() {
    const { title, ItemDisplay, items } = this.props
    const { searching, search } = this.state

    const found = items.filter(matches(search))

    return (
      <Modal
        visible={true}
        title={title}
        onCancel={this.props.close}
        onOk={this.props.close}
        className="list-browser-modal"
      >
        {items.length > 0
          ? <div>
              <Search onSearch={this.onSearchChange} key="search" />
              <div key="list" className="list-container">
                {found.map(i => (
                  <div key={i.id || i.name} className="list-item">
                    <ItemDisplay item={i} />
                  </div>
                ))}
              </div>
            </div>
          : <div className="no-items-container">
              {`No ${title.toLowerCase()} exist yet`}
            </div>}
      </Modal>
    )
  }
}
