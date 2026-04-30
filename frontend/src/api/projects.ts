import API from './axios'

export async function listProjects() {
  const res = await API.get('/projects')
  return res.data
}

export async function createProject(data: { name: string; description?: string }) {
  const res = await API.post('/projects', data)
  return res.data
}

export async function getProject(id: string) {
  const res = await API.get(`/projects/${id}`)
  return res.data
}

export async function updateProject(id: string, data: any) {
  const res = await API.put(`/projects/${id}`, data)
  return res.data
}

export async function deleteProject(id: string) {
  const res = await API.delete(`/projects/${id}`)
  return res.data
}

export async function addProjectMember(projectId: string, data: { userId: string; role: string }) {
  const res = await API.post(`/projects/${projectId}/members`, data)
  return res.data
}

export async function removeProjectMember(projectId: string, userId: string) {
  const res = await API.delete(`/projects/${projectId}/members/${userId}`)
  return res.data
}
