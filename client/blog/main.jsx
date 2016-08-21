import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import customTheme from '../lib/custom-theme.js'
import posts from './posts'
import {Card, CardActions, CardTitle, CardHeader, CardText} from 'material-ui/Card'
import Paper from 'material-ui/Paper'

export default class Main extends React.Component {
  constructor () {
    super()
    this.state = {
      posts: posts
    }
  }

  render () {
    const posts = this.state.posts.map((p,idx) => this.renderPost(p, idx))

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div className='page-container'>
          <div className='blog-post-containers'>
            {posts}
          </div>
        </div>
      </MuiThemeProvider>
    )
  }

  renderPost (post, idx) {
    const {title, subtitle, body} = post
    return (
      <Card key={idx} className='blog-post' style={{position: 'relative'}} >
        <CardHeader
          avatar='https://avatars3.githubusercontent.com/u/10324926?v=3&s=460'
          title='Ben Packer'
          subtitle='Creator'
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardTitle
          title={title}
          subtitle={subtitle}
        />
        {body}
      </Card>
    )
  }
}
