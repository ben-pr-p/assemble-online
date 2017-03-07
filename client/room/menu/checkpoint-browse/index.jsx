import { Component, h } from 'preact'
import ListBrowser from '../../../common/list-browser'
import Updates from '../../../lib/updates'

class CheckpointItem extends Component {
  goTo = () => Updates.emit('move-to', this.props.item.loc)

  render ({item}) {
    return (
      <div className='checkpoint-item' onClick={this.goTo} >
        <div className='checkpoint-color'
          style={{'background-color': item.color}}
        />
        <div className='checkpoint-label'> {item.name} </div>
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
        close={this.props.close}
      />
    )
  }
}
