import React from 'react'
import {CardText} from 'material-ui/Card'

const posts = [
  {
    title: 'coming soon',
    subtitle: 'the blog section here is coming soon!',
    body: (
      <CardText style={{position: 'relative'}} expandable={true} >
        <p> coming soon! </p>
      </CardText>
    )
  },
  {
    title: 'an introduction',
    subtitle: 'design philosophy, goals, and roadmap',
    body: (
      <CardText style={{position: 'relative'}} expandable={true} >
        <p> Welcome to assemble.live, a new platform for online interaction that aims to facillitate enjoyable, immersive, inclusive, and productive electronically facillitated  meetings. </p>

        {/*<h3>Inspiration</h3>*/}

        <p> The problem designing tools to facillitate communication is complex, owing its complexity to the vast variety of ways individuals organize themselves offline and the complexity of human collective action itself. In a nutshell, assemble.live aims to circumvent all of this complexity through a virtual environment that implements a limited set of the same basic features and constraints on communication that exist for a bunch of people in a room. </p>

        <p> In the physical world, you can move around and you can talk. Let's call these features. Of course you can do more things than that, but you can do that too. As you move further away from someone, you can't hear them as well. Let's call that a constraint, or a rule. </p>

        <p> Both the features and constraints are equally necessary for a productive large group conversation to occur. As an example, imagine a world where audio did not sound quieter the further away its source. It would be impossible to break into subgroups - no matter the size of the room and how far people were away from each other, everyone would have to be in a single conversation, collectively coordinating taking of turns on a massive scale. In fact, the whole world would be in one conversation, or more likely drowned out by the chorus of crying babies. It is the combination of features and constraints that create the flexibility in discourse strategies observed in the real world. </p>

        <p> Thus, in order to create the flexibility required to handle the complexity of human collective action, assemble.live aims to implement a core set of features and corresponding constraints that are inspired by real-world communication. Where analogy to physical phenomena is no longer apt or overly constraining, assemble.live will break with the analogy. </p>
      </CardText>
    )
  },
  {
    title: 'the tech stack',
    subtitle: 'open source relying on only open source libraries: Node.js, Socket.io, EasyRTC, React, D3',
    body: (
      <CardText style={{position: 'relative'}} expandable={true} >
        <p> assemble.live is web-based, using WebRTC technology for audio transmission. As a result, it runs on any browser that has implemented WebRTC, which include Firefox, Chrome, Opera, any derivatives (Canary, Nightly, etc.). I used <a href='https://easyrtc.com'>easyrtc's</a> signaling server and complimentary client API because it was easy. Real time updating of user locations and messages is performed using socket.io. The front-end is build with React and the <a href='http://www.material-ui.com/#/'>Material-UI</a> library that implements a set of components in the Material Design standard. I use D3 for some random things. <a href='http://github.com/assemble-live/assemble'>Here's the Github!</a></p>
      </CardText>
    )
  }
]

const toShow = [posts[0]]
export default toShow
