const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Remove trailing slash if present
const cleanApiUrl = API_BASE_URL.replace(/\/$/, '');
const apiUrl = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

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

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${apiUrl}${endpoint}`;
    
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
    return this.request<Service[]>('/services/');
  }

  // Шаг 3: Получить офферинги по услуге
  async getOfferings(serviceId: number, masterId?: number): Promise<Offering[]> {
    const params = new URLSearchParams();
    params.append('service_id', serviceId.toString());
    if (masterId) {
      params.append('master_id', masterId.toString());
    }

    return this.request<Offering[]>(`/offerings/?${params.toString()}`);
  }

  // Шаг 4: Получить доступные слоты времени
  async getTimeSlots(offeringId: number): Promise<string[]> {
    return this.request<string[]>(`/offerings/${offeringId}/slots/`);
  }

  // Шаг 5: Создать запись
  async createAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // 5a: Отправить/обновить код подтверждения
  async refreshConfirmationCode(appointmentId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/appointments/${appointmentId}/refresh/`, {
      method: 'POST',
    });
  }

  // 5b: Подтвердить кодом
  async confirmAppointment(appointmentId: number, confirmationCode: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/appointments/${appointmentId}/confirm/`, {
      method: 'POST',
      body: JSON.stringify({ confirmation_code: confirmationCode }),
    });
  }

  // Админ методы (опционально)
  async adminConfirmAppointment(appointmentId: number, authToken: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/appointments/${appointmentId}/admin_confirm/`, {
      method: 'POST',
      headers: {
        'Auth-Token': authToken,
      },
    });
  }

  async deleteAppointment(appointmentId: number, authToken: string): Promise<void> {
    return this.request<void>(`/appointments/${appointmentId}/`, {
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
    return this.request<Appointment[]>(`/appointments/${query ? `?${query}` : ''}`);
  }
}

export const apiService = new ApiService();