import { Component, h } from 'preact'

export default class Button {
  baseClasses = ['button']

  computeClass = (input) =>
    Array.isArray(input)
      ? this.baseClasses.concat(input)
      : typeof input == 'string'
        ? this.baseClasses.concat([input])
        : [].concat(this.baseClasses)

  joinClass = (input) => this.computeClass(input).join(' ')

  render ({onClick, href, className, icon, text}) {
    return (typeof href == 'string')
      ? <a {...{href, className: this.joinClass(className)}}>
          {icon}
          {text}
        </a>
      : <a {...{onClick, className: this.joinClass(className)}}>
          {icon}
          {text}
        </a>
  }
}
