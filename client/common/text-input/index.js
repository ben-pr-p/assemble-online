import { Component, h } from 'preact'

export default class TextInput extends Component {
  render ({label, ...other}) {
    return (
      <form className='text-input-form'>
        {label && <label className='text-input-label'> {label} </label>}
        <input {...{className: 'text-input', ...other}} />
      </form>
    )
  }
}
