import { Component, h } from 'preact'
import ListBrowser from '../../common/list-browser'
import Updates from '../../lib/updates'

class CheckpointItem extends Component {
  goTo = Updates.emit('')

  render ({item}) {
    return (
      <div className='checkpoint-item'>
        <div className='checkpoint-color'
          style={{'background-color': item.color}}
        />
        <div className='checkpoint-label'> {item.title} </div>
        <div className='checkpoint-description'> {item.description} </div>
      </div>
    )
  }
}

export default class CheckpointBrowser extends Component {
  render ({checkpoints}) {
    return (
      <ListBrowser
        title='Checkpoints'
        items={checkpoints}
        ItemDisplay={CheckpointItem}
      />
    )
  }
}
