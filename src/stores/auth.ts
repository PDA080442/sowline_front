import { ref } from 'vue'
import { defineStore } from 'pinia'

import { clearTokens, getAccessToken } from '@/api/tokens'
import { useProfileApi } from '@/composables/Requests'
import type { UserProfile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<UserProfile | null>(null)
  let profileRequest: Promise<UserProfile | null> | null = null

  const isAuthenticated = () => Boolean(getAccessToken())

  const setProfile = (value: UserProfile | null) => {
    profile.value = value
  }

  /** Loads the profile once when a token exists but the profile is not in memory (e.g. after reload). */
  const ensureProfile = async (): Promise<UserProfile | null> => {
    if (profile.value) {
      return profile.value
    }

    if (!getAccessToken()) {
      return null
    }

    if (!profileRequest) {
      const profileApi = useProfileApi()
      profileRequest = profileApi
        .getProfile()
        .then((value) => {
          profile.value = value
          return value
        })
        .catch(() => null)
        .finally(() => {
          profileRequest = null
        })
    }

    return profileRequest
  }

  const logout = () => {
    profile.value = null
    clearTokens()
  }

  return {
    profile,
    isAuthenticated,
    setProfile,
    ensureProfile,
    logout,
  }
})
