export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  cityId?: string;
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
      return process.env.NEXT_PUBLIC_API_URL_DEV || 'https://dev.api.municipall.dev';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.municipall.dev';
};

export interface City {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  useGradient: boolean;
  logoUrl: string;
  features: string[];
  boundary?: unknown;
}

export interface CityStats {
  name: string;
  users: number;
  agents: number;
  pending: number;
}

export interface Invitation {
  id: number;
  email: string;
  cityId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export interface Activity {
  type: 'city' | 'user' | 'agent' | 'alert';
  text: string;
  time: string;
  cityId?: string;
}

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

  async getActivity(): Promise<Activity[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/activity`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      return null;
    }
  },

  async getUsers(): Promise<User[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching users:', error);
      return null;
    }
  },

  async getDockerContainers(): Promise<DockerContainer[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
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
  },

  async getTables(): Promise<string[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/database/tables`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching tables:', error);
      return null;
    }
  },

  async getTableData(tableName: string, limit = 50, offset = 0) {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/database/tables/${tableName}?limit=${limit}&offset=${offset}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(`[API DEBUG] Error fetching table data for ${tableName}:`, error);
      return null;
    }
  },

  async executeQuery(query: string) {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/database/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Failed to execute query');
      return json.data;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[API DEBUG] Error executing query:', err);
      return { error: err.message };
    }
  },

  async getCities(): Promise<City[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching cities:', error);
      return null;
    }
  },

  async addCity(data: Partial<City> & { boundary?: unknown }): Promise<City | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to add city');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error adding city:', error);
      return null;
    }
  },

  async updateCity(id: string, data: Partial<City>): Promise<City | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to update city');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error updating city:', error);
      return null;
    }
  },

  async deleteCity(id: string): Promise<boolean> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      return response.ok;
    } catch (error) {
      console.error('[API DEBUG] Error deleting city:', error);
      return false;
    }
  },

  async getCityStats(): Promise<CityStats[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/stats`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching city stats:', error);
      return null;
    }
  },

  async getCityAgents(cityId: string): Promise<User[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/${cityId}/agents`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch agents');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching city agents:', error);
      return null;
    }
  },

  async getCityInvitations(cityId: string): Promise<Invitation[] | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/${cityId}/invitations`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error fetching city invitations:', error);
      return null;
    }
  },

  async createInvitation(cityId: string, email: string): Promise<Invitation | null> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/cities/${cityId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to create invitation');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('[API DEBUG] Error creating invitation:', error);
      return null;
    }
  },

  async forceAcceptInvitation(invitationId: number): Promise<boolean> {
    try {
      const API_BASE_URL = getBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/invitations/${invitationId}/force-accept`, {
        method: 'POST',
        cache: 'no-store'
      });
      return response.ok;
    } catch (error) {
      console.error('[API DEBUG] Error force accepting invitation:', error);
      return false;
    }
  }
};
