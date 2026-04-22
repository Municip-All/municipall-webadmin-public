export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  uptime: string;
  cpu: string;
  memory: string;
}

export interface MonitoringStats {
  business: {
    cities: number;
    users: number;
    agents: number;
    citizens: number;
    satisfaction: number;
  };
  system: {
    cpu: {
      load: number;
      cores: number;
    };
    memory: {
      total: number;
      used: number;
      percentage: number;
    };
    uptime: number;
    platform: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.municipall.dev';

export const api = {
  async getStats(): Promise<MonitoringStats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  },

  async getUsers(): Promise<User[] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return null;
    }
  },

  async getDockerContainers(): Promise<DockerContainer[] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/docker`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching docker stats:', error);
      return null;
    }
  }
};
