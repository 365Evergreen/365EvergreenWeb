const fallbackApiBaseUrl = '/api'

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl,
  environment: import.meta.env.MODE,
}
