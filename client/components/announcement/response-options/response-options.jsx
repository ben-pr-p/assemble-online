import React from 'react'
import ThumbIcon from 'material-ui/svg-icons/action/thumb-up'
import BlockIcon from 'material-ui/svg-icons/content/report'

const responseOptions = [
  {label: 'Support', name: 'agree'},
  {label: 'Support with Reservations', name: 'reservations'},
  {label: 'Block', name: 'block'}
]

const icons = {
  agree: (<ThumbIcon className='support-icon' />),
  reservations: (<ThumbIcon className='reservations-icon' />),
  block: (<BlockIcon className='block-icon' />)
}

export {responseOptions, icons}
