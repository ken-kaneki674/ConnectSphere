import { createStore } from 'vuex'
import auth from './modules/auth'
import posts from './modules/posts'
import comments from './modules/comments'
import likes from './modules/likes'
import messages from './modules/messages'
import groups from './modules/groups'

export default createStore({
  modules: {
    auth,
    posts,
    comments,
    likes,
    messages,
    groups
  }
})
