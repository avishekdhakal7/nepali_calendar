import axios from 'axios'

let isRefreshing = false
let refreshQueue: Array<() => void> = []

function onRefresh() {
  refreshQueue.forEach(cb => cb())
  refreshQueue = []
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/auth/refresh/`,
            {},
            { withCredentials: true }
          )
          onRefresh()
          isRefreshing = false
        } catch (refreshError) {
          isRefreshing = false
          console.error('[API 401]', error.response?.config?.url, error.response?.data)
          console.error('[API Refresh Failed]', refreshError)
          return Promise.reject(error)
        }
      } else {
        return new Promise(resolve => {
          refreshQueue.push(() => resolve(api(original)))
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api
