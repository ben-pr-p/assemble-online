import React, { Component } from 'react'
import { Button, Icon, Input, Tooltip } from 'antd'
import { Browser } from '../../../../../common/icons'

/* Notes on agenda items as you're doing them */

export default class BrowserWidget extends Component {
  static icon = (
    <Browser
      style={{
        transform: 'scale(1.5)',
        height: '32px',
        width: '32px',
      }}
    />
  )

  static kind = 'Browser'
  static initial = {
    url: '',
  }

  setUrl = ev =>
    this.props.update({
      url: ev.target.value.startsWith('http://') ||
        ev.target.value.startsWith('https://')
        ? ev.target.value
        : ev.target.value.includes(' ') || !ev.target.value.includes('.')
            ? `https://duckduckgo.com/?q=${encodeURIComponent(ev.target.value)}`
            : 'http://' + ev.target.value,
    })

  render() {
    const { url } = this.props

    return (
      <div className="browser">
        <Input
          style={{ height: '32px' }}
          addonBefore={
            <Button.Group size="small">
              <Button icon="left" onClick={this.back} />
              <Button icon="right" onClick={this.forward} />
            </Button.Group>
          }
          addonAfter={<Icon type="setting" />}
          defaultValue="mysite"
          onPressEnter={this.setUrl}
        />
        <iframe
          src={url}
          width="100%"
          height="400px"
          frameBorder="0"
          onLoad={this.onLoad}
          onError={this.onError}
        />
      </div>
    )
  }
}
