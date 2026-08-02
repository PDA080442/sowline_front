import axios, { AxiosError, isAxiosError, type InternalAxiosRequestConfig } from 'axios'

import type { ApiErrorResponse } from '@/types'

import { notifyUnauthorized } from './session'
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './tokens'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/**
 * Auth endpoints must never trigger the refresh/redirect flow: a 401 there is a
 * legitimate result (e.g. wrong password → INVALID_CREDENTIALS, expired refresh).
 */
const AUTH_ENDPOINTS = [
  '/api/auth/login/',
  '/api/auth/register/',
  '/api/auth/refresh/',
  '/api/auth/verify-email/',
  '/api/auth/password/reset/',
  '/api/auth/password/confirm/',
]

let refreshPromise: Promise<string | null> | null = null

/** Refreshes the access token, de-duplicating concurrent refreshes into one request. */
const refreshAccessToken = (): Promise<string | null> => {
  const refresh = getRefreshToken()

  if (!refresh) {
    return Promise.resolve(null)
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access?: string }>(
        `${baseURL}/api/auth/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((response) => {
        const access = response.data?.access ?? null

        if (access) {
          setAccessToken(access)
        }

        return access
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

const endSession = () => {
  clearTokens()
  notifyUnauthorized()
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const url = original?.url ?? ''

    if (status !== 401 || !original || AUTH_ENDPOINTS.some((path) => url.includes(path))) {
      return Promise.reject(error)
    }

    // Expired access token: attempt one silent refresh, then replay the request.
    if (error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true

      const access = await refreshAccessToken()

      if (access) {
        original.headers.Authorization = `Bearer ${access}`
        return apiClient.request(original)
      }
    }

    // Any other 401 (UNAUTHORIZED, TOKEN_NOT_VALID) or a failed refresh → sign out.
    endSession()
    return Promise.reject(error)
  },
)

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: ApiErrorResponse

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

export const isApiRequestError = (error: unknown): error is ApiRequestError =>
  error instanceof ApiRequestError

export const parseApiError = (error: unknown): ApiRequestError | Error => {
  if (isApiRequestError(error)) {
    return error
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const status = axiosError.response?.status ?? 0
    const body = axiosError.response?.data

    if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
      return new ApiRequestError(status, body)
    }

    return new Error(axiosError.message || 'Network request failed')
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Unknown error')
}
