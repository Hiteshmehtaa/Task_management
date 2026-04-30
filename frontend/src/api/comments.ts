import API from './axios'

export async function createComment(taskId: string, data: { content: string }) {
  const res = await API.post(`/tasks/${taskId}/comments`, data)
  return res.data
}

export async function listComments(taskId: string) {
  const res = await API.get(`/tasks/${taskId}/comments`)
  return res.data
}
