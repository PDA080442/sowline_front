/**
 * Bridge between the axios layer and the app (router + stores) so that
 * `client.ts` can trigger a "session expired" flow without importing the
 * router or Pinia stores directly (which would create circular imports).
 *
 * The concrete handler is registered once during app bootstrap in `main.ts`.
 */
type UnauthorizedHandler = () => void

let handler: UnauthorizedHandler | null = null

export const setUnauthorizedHandler = (fn: UnauthorizedHandler): void => {
  handler = fn
}

export const notifyUnauthorized = (): void => {
  handler?.()
}
