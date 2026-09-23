import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Profile from '../views/profile/View.vue'
import Feed from '../views/posts/Feed.vue'
import Messages from '../views/messages/Inbox.vue'
import Groups from '../views/groups/List.vue'
import GroupDetail from '../views/groups/Detail.vue'
import Search from '../views/Search.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/feed',
    name: 'Feed',
    component: Feed
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups,
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id',
    name: 'GroupDetail',
    component: GroupDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(to => {
  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'Feed' }
  }
})

export default router
