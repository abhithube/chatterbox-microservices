import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

http.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')

  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`
  }

  return req
})

http.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      const { token } = await http.post<null, { token: string }>(
        '/auth/refresh',
        null,
        { withCredentials: true },
      )

      localStorage.setItem('token', token)

      err.config.headers.Authorization = `Bearer ${token}`
      err.config._retry = true

      return axios(err.config)
    }

    let message = 'Internal server error'
    if (axios.isAxiosError(err)) message = err.response?.data

    return Promise.reject(message)
  },
)
