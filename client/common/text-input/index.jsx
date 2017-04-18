import React, { Component } from 'react'

export default class TextInput extends Component {
  render () {
    const {label, ...other} = this.props

    return (
      <form className='text-input-form'>
        {label && <label className='text-input-label'> {label} </label>}
        <input {...{className: 'text-input', ...other}} />
      </form>
    )
  }
}
