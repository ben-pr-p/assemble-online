import React from 'react'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import {PhotoshopPicker} from 'react-color'

export default class Colors extends React.Component {
  constructor () {
    super()

    this.state = {
      picking: null
    }

    const boundMethods = 'onColorChangeComplete onDone restore showPicker'.split(' ')
    boundMethods.forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  showPicker (ev) {
    this.setState({
      picking: ev.target.textContent
    })
  }

  onColorChangeComplete (color) {
    let newColors = {}
    newColors[this.state.picking] = color.hex
    this.props.setColors(newColors)

    this.setState({
      picking: null
    })
  }

  restore () {
  }

  onDone () {
    this.props.closeColorModal()
  }

  handleClose () {
  }

  render () {
    const {picking} = this.state
    const {palette} = this.props

    const fields = []
    for (let color in palette) {
      if (fields.length >= 1)
        fields.push((<Divider key={'divider-' + color} />))

      fields.push((
        <div key={color} className='color-item' onClick={this.showPicker} data={color} >
          <div className='color-text'>
            {color}
          </div>
          <div className='color-visual-container'>
            <div className='color-visual' style={{backgroundColor: palette[color]}} ></div>
          </div>
        </div>
      ))

      if (color == picking)
        fields.push((
          <div className='color-picker-container'>
            <PhotoshopPicker
              color={palette[color]} 
              onChangeComplete={this.onColorChangeComplete}
              handleClose={this.handleClose}
            />
          </div>
        ))
    }

    const actions = [
      (<RaisedButton key='restore' label='Restore'
        onClick={this.restore} />),
      (<RaisedButton key='done' label='Done'
        onClick={this.onDone} />)
    ]

    return (
      <Dialog title='Change the Colors'
        modal={true}
        open={true}
        actions={actions}
      >
        <div className='color-list'>
          {fields}
        </div>
      </Dialog>
    )
  }
}

