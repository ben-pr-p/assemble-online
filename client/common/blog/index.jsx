import React, { Component } from 'react'
import { Back, Open } from '../icons'
import IconButton from '../icon-button'

const pdfs = 'proposal'
  .split(' ')
  .map(p => `/papers/${p}.pdf`)

const extract = path => {
  const split = path.split('/')
  return split[split.length - 1].split('.')[0]
}

export default class Blog extends Component {
  state = {
    viewing: null
  }

  expand = p => ev => this.setState({viewing: p})
  viewNull = ev => this.setState({viewing: false})

  render () {
		const {viewing} = this.state

    if (viewing) {
      return (
        <div style={{height: '100%', width: '100%', overflow: 'scroll'}}>
          <div className='controls'>
            <IconButton onClick={this.viewNull}>
              <Back />
            </IconButton>
          </div>
          <object data={viewing} type='application/pdf' style={{width: '100%', height: '100%'}}>
            <embed src={viewing} type='application/pdf' />
          </object>
        </div>
      )
    } else {
      return (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          textAlign: 'center'
        }} >
          {pdfs.map((p,idx) => (
            <div key={idx} style={{
                width: '200px',
                height: '270px',
                margin: '10px',
                cursor: 'pointer'
              }}
              onClick={this.expand(p)}
            >
              <object data={p} type='application/pdf' style={{
                  height: '250px',
                  width: '200px',
                  cursor: 'pointer'
                }}
                onClick={this.expand(p)}
              >
                <embed src={p} type='application/pdf' />
              </object>
              <div className='clickable'>
                {extract(p)}
                <Open color='white' />
              </div>
            </div>
          ))}
        </div>
      )
    }
  }
}
