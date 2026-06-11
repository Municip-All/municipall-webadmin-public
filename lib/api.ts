export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  cityId?: string;
  points?: number;
  created_at: string;
  updated_at?: string;
  update_at?: string;
}

export type UpdateUserPayload = {
  name?: string;
  surname?: string;
  role?: string;
  cityId?: string;
  password?: string;
};

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

import { adminFetch, parseAdminJson } from "./adminApi";

async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await adminFetch(path, init);
    return await parseAdminJson<T>(response);
  } catch (error) {
    console.error(`[API] ${path}:`, error);
    return null;
  }
}

async function adminRequestOrThrow<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await adminFetch(path, init);
  return parseAdminJson<T>(response);
}

export type CityIntegrationType = "widget" | "mobile_app" | "both";

export interface City {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  useGradient: boolean;
  logoUrl: string;
  features: string[];
  isTransportFeatureAllowed?: boolean;
  isTransportFeatureEnabled?: boolean;
  boundary?: unknown;
  dataRetentionPolicy?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactHelpText?: string;
  contractNumber?: string;
  contractSignedAt?: string;
  contractNotes?: string;
  municipalityContactName?: string;
  municipalityContactRole?: string;
  municipalityContactEmail?: string;
  municipalityContactPhone?: string;
  assignedTechName?: string;
  assignedTechEmail?: string;
  salesRepName?: string;
  salesRepEmail?: string;
  integrationType?: CityIntegrationType;
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
  type: "city" | "user" | "agent" | "alert";
  text: string;
  time: string;
  cityId?: string;
}

export const api = {
  async getStats(): Promise<MonitoringStats | null> {
    return adminRequest<MonitoringStats>(`/api/v1/admin/stats`, {
      cache: "no-store",
    });
  },

  async getActivity(): Promise<Activity[] | null> {
    return adminRequest<Activity[]>(`/api/v1/admin/activity`, {
      cache: "no-store",
    });
  },

  async getUsers(): Promise<User[] | null> {
    return adminRequest<User[]>(`/api/v1/admin/users`, { cache: "no-store" });
  },

  async getUser(id: number): Promise<User | null> {
    return adminRequest<User>(`/api/v1/admin/users/${id}`, {
      cache: "no-store",
    });
  },

  async updateUser(id: number, data: UpdateUserPayload): Promise<User | null> {
    return adminRequest<User>(`/api/v1/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await adminFetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      return response.ok;
    } catch (error) {
      console.error("[API] deleteUser:", error);
      return false;
    }
  },

  async getDockerContainers(): Promise<DockerContainer[] | null> {
    return adminRequest<DockerContainer[]>(`/api/v1/admin/docker`, {
      cache: "no-store",
    });
  },

  async getTables(): Promise<string[] | null> {
    return adminRequest<string[]>(`/api/v1/admin/database/tables`, {
      cache: "no-store",
    });
  },

  async getTableData(tableName: string, limit = 50, offset = 0) {
    return adminRequest(
      `/api/v1/admin/database/tables/${tableName}?limit=${limit}&offset=${offset}`,
      { cache: "no-store" },
    );
  },

  async getDemoSeedStatus(): Promise<{ enabled: boolean } | null> {
    return adminRequest<{ enabled: boolean }>(`/api/v1/admin/demo/seed/status`, {
      cache: "no-store",
    });
  },

  async runDemoSeed(options?: {
    reset?: boolean;
  }): Promise<{ output: string; durationMs: number }> {
    return adminRequestOrThrow<{ output: string; durationMs: number }>(
      `/api/v1/admin/demo/seed`,
      {
        method: "POST",
        body: JSON.stringify(options ?? {}),
        cache: "no-store",
      },
    );
  },

  async executeQuery(query: string) {
    try {
      const response = await adminFetch(`/api/v1/admin/database/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store",
      });
      const json = await response.json();
      if (!json.success)
        throw new Error(json.error || "Failed to execute query");
      return json.data;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[API DEBUG] Error executing query:", err);
      return { error: err.message };
    }
  },

  async getCities(): Promise<City[] | null> {
    return adminRequest<City[]>(`/api/v1/admin/cities`, { cache: "no-store" });
  },

  async addCity(
    data: Partial<City> & { boundary?: unknown },
  ): Promise<City | null> {
    return adminRequest<City>(`/api/v1/admin/cities`, {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  async updateCity(id: string, data: Partial<City>): Promise<City | null> {
    return adminRequest<City>(`/api/v1/admin/cities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  async deleteCity(id: string): Promise<boolean> {
    try {
      const response = await adminFetch(`/api/v1/admin/cities/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      return response.ok;
    } catch (error) {
      console.error("[API DEBUG] Error deleting city:", error);
      return false;
    }
  },

  async getCityStats(): Promise<CityStats[] | null> {
    return adminRequest<CityStats[]>(`/api/v1/admin/cities/stats`, {
      cache: "no-store",
    });
  },

  async getCityAgents(cityId: string): Promise<User[] | null> {
    return adminRequest<User[]>(`/api/v1/admin/cities/${cityId}/agents`, {
      cache: "no-store",
    });
  },

  async getCityInvitations(cityId: string): Promise<Invitation[] | null> {
    return adminRequest<Invitation[]>(
      `/api/v1/admin/cities/${cityId}/invitations`,
      {
        cache: "no-store",
      },
    );
  },

  async createMayor(
    cityId: string,
    data: { email: string; name: string; surname: string; password: string },
  ): Promise<User> {
    return adminRequestOrThrow<User>(`/api/v1/admin/cities/${cityId}/mayor`, {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  async createInvitation(
    cityId: string,
    data: { email: string; name?: string; role?: string },
  ): Promise<Invitation | null> {
    return adminRequest<Invitation>(
      `/api/v1/admin/cities/${cityId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify(data),
        cache: "no-store",
      },
    );
  },

  async forceAcceptInvitation(invitationId: number): Promise<boolean> {
    try {
      const response = await adminFetch(
        `/api/v1/admin/invitations/${invitationId}/force-accept`,
        {
          method: "POST",
          cache: "no-store",
        },
      );
      return response.ok;
    } catch (error) {
      console.error("[API DEBUG] Error force accepting invitation:", error);
      return false;
    }
  },
};
