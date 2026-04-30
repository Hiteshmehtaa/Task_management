import API from './axios'

export async function signup(data: { name: string; email: string; password: string }) {
  const res = await API.post('/auth/signup', data)
  return res.data
}

export async function login(data: { email: string; password: string }) {
  const res = await API.post('/auth/login', data)
  return res.data
}

export async function refresh() {
  const res = await API.post('/auth/refresh')
  return res.data
}

export async function logout() {
  const res = await API.post('/auth/logout')
  return res.data
}
