import './assets/a11y.css'
import './assets/main.css'

import { createApp } from 'vue'

import { setUnauthorizedHandler } from './api/session'
import App from './App.vue'
import { pinia } from './plugins/pinia'
import vuetify from './plugins/vuetify'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useWorkspaceStore } from './stores/workspace'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

// Session-expired flow: any unrecoverable 401 clears the session and sends the
// user to the login page, preserving where they were for post-login redirect.
setUnauthorizedHandler(() => {
  useAuthStore(pinia).logout()
  useWorkspaceStore(pinia).clearCurrentWorkspace()

  const current = router.currentRoute.value

  if (current.name !== 'auth-login') {
    router.push({ name: 'auth-login', query: { redirect: current.fullPath } })
  }
})

app.mount('#app')
