import API from './axios'

export async function listTasks(projectId: string, filters?: any) {
  const params = filters || {}
  const res = await API.get(`/projects/${projectId}/tasks`, { params })
  return res.data
}

export async function createTask(data: any) {
  const res = await API.post(`/projects/${data.projectId}/tasks`, data)
  return res.data
}

export async function updateTask(id: string, data: any) {
  const res = await API.put(`/tasks/${id}`, data)
  return res.data
}

export async function deleteTask(id: string) {
  const res = await API.delete(`/tasks/${id}`)
  return res.data
}
