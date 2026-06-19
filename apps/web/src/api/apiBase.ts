import { appConfig } from '../config/env'

export function apiBase(): string {
  return appConfig.apiBaseUrl
}
