import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Profile from '../views/profile/View.vue'
import Feed from '../views/posts/Feed.vue'
import Messages from '../views/messages/Inbox.vue'
import Groups from '../views/groups/List.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/feed',
    name: 'Feed',
    component: Feed
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
