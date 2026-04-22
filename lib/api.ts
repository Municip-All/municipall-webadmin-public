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

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const env = localStorage.getItem('municipall_env') || 'PROD';
    if (env === 'DEV') {
      return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:3001';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.municipall.dev';
};

export const api = {
  async getStats(): Promise<MonitoringStats | null> {
    try {
      const API_BASE_URL = getBaseUrl();
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
      const API_BASE_URL = getBaseUrl();
      console.log(`[API DEBUG] Fetching users from: ${API_BASE_URL}`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error(`[API DEBUG] HTTP Error: ${response.status}`);
        throw new Error('Failed to fetch');
      }
      
      const json = await response.json();
      console.log(`[API DEBUG] Received ${json.data?.length || 0} users`);
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching users:', error);
      return null;
    }
  },

  async getDockerContainers(): Promise<DockerContainer[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      console.log(`[API DEBUG] Fetching docker from: ${API_BASE_URL}`);
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/docker`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching docker stats:', error);
      return null;
    }
  }
};
