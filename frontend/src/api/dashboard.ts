import axios from './axios'

export interface DashboardData {
  userName: string;
  myTasks: any[];
  overdueCount: number;
  projectCount: number;
  tasksByStatus: Record<string, number>;
  recentActivity: any[];
}

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await axios.get('/dashboard')
  return data
}
