import { h, Component } from 'preact'
import ThumbIcon from '../../../common/icons/thumbs-up'
import BlockIcon from '../../../common/icons/report'

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
