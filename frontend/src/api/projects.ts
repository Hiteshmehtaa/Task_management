import API from './axios'

export type ProjectMemberUser = {
  id: string
  name: string
  email: string
}

export type ProjectMember = {
  id: string
  projectId: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  user: ProjectMemberUser
}

export type Project = {
  id: string
  name: string
  description?: string | null
  ownerId: string
  projectKey: string
  createdAt: string
  members?: ProjectMember[]
  tasks?: Array<{ id: string }>
}

export type ProjectCreateResponse = Project & {
  secretKey: string
  message: string
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type JoinRequestUser = {
  id: string
  name: string
  email: string
  avatarInitials: string
}

export type JoinRequest = {
  id: string
  status: JoinRequestStatus
  createdAt: string
  projectId: string
  userId: string
  project: Project
  user: JoinRequestUser
}

export type ProjectJoinRequest = {
  id: string
  status: JoinRequestStatus
  createdAt: string
  user: JoinRequestUser
}

export async function listProjects() {
  const res = await API.get('/projects')
  return res.data
}

export async function createProject(data: { name: string; description?: string }): Promise<ProjectCreateResponse> {
  const res = await API.post('/projects', data)
  return res.data
}

export async function getProject(id: string): Promise<Project> {
  const res = await API.get(`/projects/${id}`)
  return res.data
}

export async function updateProject(id: string, data: Partial<Pick<Project, 'name' | 'description'>>) {
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

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await API.get(`/projects/${projectId}/members`)
  return res.data
}

export async function joinProject(data: { projectKey: string; secretKey: string }) {
  const res = await API.post('/projects/join', data)
  return res.data as { message: string }
}

export async function listProjectJoinRequests(projectId: string): Promise<ProjectJoinRequest[]> {
  const res = await API.get(`/projects/${projectId}/join-requests`)
  return res.data
}

export async function handleProjectJoinRequest(
  projectId: string,
  requestId: string,
  data: { action: 'approve' | 'reject' }
) {
  const res = await API.patch(`/projects/${projectId}/join-requests/${requestId}`, data)
  return res.data as JoinRequest
}

export async function listMyJoinRequests(): Promise<JoinRequest[]> {
  const res = await API.get('/users/me/join-requests')
  return res.data
}

export async function regenerateProjectKey(projectId: string) {
  const res = await API.post(`/projects/${projectId}/regenerate-key`)
  return res.data as ProjectCreateResponse
}
