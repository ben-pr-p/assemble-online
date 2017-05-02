import React from 'react'
import { render } from 'react-dom'
import { LocaleProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import Main from './room/main'

window.onload = () => {
  render(
    <LocaleProvider locale={enUS}>
      <Main />
    </LocaleProvider>,
    document.querySelector('#reactAppContainer')
  )
}
