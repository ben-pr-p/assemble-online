import React from 'react'
import { render } from 'react-dom'
import { LocaleProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import Portal from './portal/main'

window.onload = () => {
  render(
    <LocaleProvider locale={enUS}>
      <Portal />
    </LocaleProvider>,
    document.querySelector('#reactAppContainer')
  )
}
