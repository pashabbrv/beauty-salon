export interface Service {
  id: number;
  name: string;
}

export interface Master {
  id: number;
  name: string;
  specialization?: string;
  rating?: number;
  avatar?: string;
}

export interface Offering {
  id: number;
  price: number;
  duration: string; // "HH:MM:SS"
  service: Service;
  master: Master;
}

export interface AppointmentRequest {
  name: string;
  phone: string;
  offering_id: number;
  datetime: string; // ISO date-time
}

export interface Appointment {
  id: number;
  name: string;
  phone: string;
  offering: Offering;
  slot: {
    start: string;
    end: string;
  };
  confirmed: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  phone: string;
  name: string;
  status: string;
  created_at: string;
}

// Extend the existing interfaces for admin functionality
export interface AdminStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  totalCustomers: number;
  totalServices: number;
  totalMasters: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Remove trailing slash if present
    const cleanApiUrl = API_BASE_URL.replace(/\/$/, '');
    
    // Ensure the endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const url = `${cleanApiUrl}${cleanEndpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Для статуса 204 (No Content) не пытаемся парсить JSON
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Шаг 2: Получить список услуг
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/api/services/');
  }

  // Шаг 3: Получить офферинги по услуге
  async getOfferings(serviceId: number, masterId?: number): Promise<Offering[]> {
    const params = new URLSearchParams();
    params.append('service_id', serviceId.toString());
    if (masterId) {
      params.append('master_id', masterId.toString());
    }

    return this.request<Offering[]>(`/api/offerings/?${params.toString()}`);
  }

  // Шаг 4: Получить доступные слоты времени
  async getTimeSlots(offeringId: number): Promise<string[]> {
    return this.request<string[]>(`/api/offerings/${offeringId}/slots/`);
  }

  // Шаг 5: Создать запись
  async createAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/api/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // 5a: Отправить/обновить код подтверждения
  async refreshConfirmationCode(appointmentId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/appointments/${appointmentId}/refresh/`, {
      method: 'POST',
    });
  }

  // 5b: Подтвердить кодом
async confirmAppointment(appointmentId: number, confirmationCode: string): Promise<{ message: string }> {
  return this.request<{ message: string }>(`/api/appointments/${appointmentId}/confirm/`, {
    method: 'POST',
    body: JSON.stringify({ confirmation_code: confirmationCode }),
  });
}

  // Админ методы (опционально)
  async adminConfirmAppointment(appointmentId: number, authToken: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/appointments/${appointmentId}/admin_confirm/`, {
      method: 'POST',
      headers: {
        'Auth-Token': authToken,
      },
    });
  }

  async deleteAppointment(appointmentId: number, authToken: string): Promise<void> {
    return this.request<void>(`/api/appointments/${appointmentId}/`, {
      method: 'DELETE',
      headers: {
        'Auth-Token': authToken,
      },
    });
  }

  // Получить список записей
  async getAppointments(date?: string, confirmed?: boolean): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (confirmed !== undefined) params.append('confirmed', confirmed.toString());

    const query = params.toString();
    return this.request<Appointment[]>(`/api/appointments/${query ? `?${query}` : ''}`);
  }
}

export const apiService = new ApiService();

class AdminApiService {
  private authToken: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      this.authToken = storedToken;
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.removeItem('adminToken');
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Remove trailing slash if present
    const cleanApiUrl = API_BASE_URL.replace(/\/$/, '');
    
    // Ensure the endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const url = `${cleanApiUrl}${cleanEndpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add auth token to headers if available
    if (this.authToken) {
      (defaultOptions.headers as Record<string, string>)['Auth-Token'] = this.authToken;
      console.log(`Sending request to ${url} with token: ${this.authToken}`);
    } else {
      // Try to get token from localStorage as fallback
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        (defaultOptions.headers as Record<string, string>)['Auth-Token'] = storedToken;
        console.log(`Sending request to ${url} with stored token: ${storedToken}`);
      } else {
        console.log(`Sending request to ${url} without token`);
      }
    }

    const config: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`, await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For status 204 (No Content) don't try to parse JSON
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // In a real app, this would be a proper login endpoint
    // For now, we'll simulate authentication using the BACKEND_TOKEN
    const token = import.meta.env.VITE_ADMIN_TOKEN || 'example';
    console.log('Token from environment:', import.meta.env.VITE_ADMIN_TOKEN);
    console.log('Using token:', token);
    this.setAuthToken(token);
    
    // Simulate a delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate successful login
    return {
      token,
      user: {
        id: 1,
        username: credentials.username,
        role: 'admin'
      }
    };
  }

  async logout(): Promise<void> {
    this.setAuthToken(null);
  }

  // Dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    // This is a simplified implementation
    // In a real app, you would have actual endpoints for these stats
    const appointments = await this.getAppointments();
    const customers = await this.getCustomers();
    const services = await this.getServices();
    const masters = await this.getMasters();
    
    const confirmedAppointments = appointments.filter(a => a.confirmed).length;
    
    return {
      totalAppointments: appointments.length,
      confirmedAppointments,
      pendingAppointments: appointments.length - confirmedAppointments,
      totalCustomers: customers.length,
      totalServices: services.length,
      totalMasters: masters.length
    };
  }

  // Customer management
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/api/customers/');
  }

  async updateCustomerStatus(phone: string, status: string): Promise<Customer> {
    return this.request<Customer>(`/api/customers/${phone}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Service management
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/api/services/');
  }

  async createService(service: { name: string }): Promise<Service> {
    return this.request<Service>('/api/services/', {
      method: 'POST',
      body: JSON.stringify(service)
    });
  }

  // Master management
  async getMasters(): Promise<Master[]> {
    return this.request<Master[]>('/api/masters/');
  }

  async createMaster(master: { name: string; phone: string }): Promise<Master> {
    return this.request<Master>('/api/masters/', {
      method: 'POST',
      body: JSON.stringify(master)
    });
  }

  // Offering management
  async getOfferings(): Promise<Offering[]> {
    return this.request<Offering[]>('/api/offerings/');
  }

  async createOffering(offering: {
    master_id: number;
    service_id: number;
    price: number;
    duration: string;
  }): Promise<Offering> {
    return this.request<Offering>('/api/offerings/', {
      method: 'POST',
      body: JSON.stringify(offering)
    });
  }

  // Appointment management
  async getAppointments(date?: string, confirmed?: boolean): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (confirmed !== undefined) params.append('confirmed', confirmed.toString());

    const query = params.toString();
    return this.request<Appointment[]>(`/api/appointments/${query ? `?${query}` : ''}`);
  }

  async deleteAppointment(appointmentId: number): Promise<void> {
    return this.request<void>(`/api/appointments/${appointmentId}/`, {
      method: 'DELETE'
    });
  }

  async confirmAppointment(appointmentId: number): Promise<{ message: string }> {
    // This would be an admin confirmation endpoint
    return this.request<{ message: string }>(`/api/appointments/${appointmentId}/admin_confirm/`, {
      method: 'POST'
    });
  }
}

export const adminApiService = new AdminApiService();