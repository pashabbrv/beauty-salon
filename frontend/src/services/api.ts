export interface Service {
  id: number;
  name: string;
}

export interface Master {
  id: number;
  name: string;
  phone: string;
  description?: string;
  photo_url?: string;
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

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string; // 'milliliters' or 'pieces'
  created_at: string;
}

export interface Transaction {
  id: number;
  offering_id: number | null;
  product_id: number | null;
  product_quantity_used: number | null;
  overtime_amount: number | null;
  total_amount: number;
  transaction_type: string; // 'income' or 'expense'
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface CashSummary {
  date: string; // YYYY-MM-DD
  income: number;
  expenses: number;
  balance: number;
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
  // Financial statistics
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  // Product statistics
  totalProducts: number;
  lowStockProducts: number;
  // Customer status statistics
  newCustomers: number;
  regularCustomers: number;
  capriciousCustomers: number;
  blockedCustomers: number;
  // Appointment statistics
  todayAppointments: number;
  upcomingAppointments: number;
  // Service statistics
  popularServices: { service: string; count: number }[];
  // Master statistics
  masterWorkload: { master: string; appointments: number }[];
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.88';

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
    return this.request<Service[]>('/services/');
  }

  async getMasters(): Promise<Master[]> {
    return this.request<Master[]>('/masters/');
  }

  // Шаг 3: Получить офферинги по услуге
  async getOfferings(serviceId?: number, masterId?: number): Promise<Offering[]> {
    const params = new URLSearchParams();
    if (serviceId) {
      params.append('service_id', serviceId.toString());
    }
    if (masterId) {
      params.append('master_id', masterId.toString());
    }

    const queryString = params.toString();
    return this.request<Offering[]>(`/offerings/${queryString ? `?${queryString}` : ''}`);
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.88';

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
    const products = await this.getProducts();
    // For financial data, we'll get the current month's summary
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const cashSummary = await this.getCashSummaryRange(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );
    
    const confirmedAppointments = appointments.filter(a => a.confirmed).length;
    
    // Calculate financial statistics
    let totalIncome = 0;
    let totalExpenses = 0;
    cashSummary.forEach(summary => {
      totalIncome += summary.income;
      totalExpenses += summary.expenses;
    });
    const currentBalance = totalIncome - totalExpenses;
    
    // Customer status statistics
    const newCustomers = customers.filter(c => c.status === 'new').length;
    const regularCustomers = customers.filter(c => c.status === 'regular').length;
    const capriciousCustomers = customers.filter(c => c.status === 'capricious').length;
    const blockedCustomers = customers.filter(c => c.status === 'blocked').length;
    
    // Appointment statistics
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => 
      a.slot.start.startsWith(todayStr)
    ).length;
    
    const now = new Date();
    const upcomingAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.slot.start);
      return appointmentDate > now && !a.confirmed;
    }).length;
    
    // Service popularity (simplified)
    const serviceCount: Record<string, number> = {};
    appointments.forEach(a => {
      const serviceName = a.offering.service.name;
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });
    
    const popularServices = Object.entries(serviceCount)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Master workload
    const masterCount: Record<string, number> = {};
    appointments.forEach(a => {
      const masterName = a.offering.master.name;
      masterCount[masterName] = (masterCount[masterName] || 0) + 1;
    });
    
    const masterWorkload = Object.entries(masterCount)
      .map(([master, appointments]) => ({ master, appointments }))
      .sort((a, b) => b.appointments - a.appointments);
    
    // Product statistics
    const lowStockProducts = products.filter(p => p.quantity < 10).length;
    
    return {
      totalAppointments: appointments.length,
      confirmedAppointments,
      pendingAppointments: appointments.length - confirmedAppointments,
      totalCustomers: customers.length,
      totalServices: services.length,
      totalMasters: masters.length,
      totalIncome,
      totalExpenses,
      currentBalance,
      totalProducts: products.length,
      lowStockProducts,
      newCustomers,
      regularCustomers,
      capriciousCustomers,
      blockedCustomers,
      todayAppointments,
      upcomingAppointments,
      popularServices,
      masterWorkload
    };
  }

  // Customer management
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers/');
  }

  async getCustomerStatuses(): Promise<string[]> {
    const response = await this.request<{ statuses: string[] }>('/customers/statuses/');
    return response.statuses;
  }

  async updateCustomerStatus(phone: string, status: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${phone}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // New methods for specific status types
  async setCustomerStatusNew(phone: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${phone}/status/new/`, {
      method: 'POST'
    });
  }

  async setCustomerStatusRegular(phone: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${phone}/status/regular/`, {
      method: 'POST'
    });
  }

  async setCustomerStatusCapricious(phone: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${phone}/status/capricious/`, {
      method: 'POST'
    });
  }

  // Service management
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services/');
  }

  async createService(service: { name: string }): Promise<Service> {
    return this.request<Service>('/services/', {
      method: 'POST',
      body: JSON.stringify(service)
    });
  }

  // Add update service method
  async updateService(serviceId: number, service: { name: string }): Promise<Service> {
    return this.request<Service>(`/services/${serviceId}/`, {
      method: 'PUT',
      body: JSON.stringify(service)
    });
  }

  // Add delete service method
  async deleteService(serviceId: number): Promise<void> {
    return this.request<void>(`/services/${serviceId}/`, {
      method: 'DELETE'
    });
  }

  // Master management
  async getMasters(): Promise<Master[]> {
    return this.request<Master[]>('/masters/');
  }

  async createMaster(master: { name: string; phone: string; description?: string; photo_url?: string }): Promise<Master> {
    return this.request<Master>('/masters/', {
      method: 'POST',
      body: JSON.stringify(master)
    });
  }

  async updateMaster(masterId: number, master: { name: string; phone: string; description?: string; photo_url?: string }): Promise<Master> {
    return this.request<Master>(`/masters/${masterId}/`, {
      method: 'PUT',
      body: JSON.stringify(master)
    });
  }

  // Add delete master method
  async deleteMaster(masterId: number): Promise<void> {
    return this.request<void>(`/masters/${masterId}/`, {
      method: 'DELETE'
    });
  }

  // Offering management
  async getOfferings(serviceId?: number, masterId?: number): Promise<Offering[]> {
    const params = new URLSearchParams();
    if (serviceId) params.append('service_id', serviceId.toString());
    if (masterId) params.append('master_id', masterId.toString());

    const queryString = params.toString();
    return this.request<Offering[]>(`/offerings/${queryString ? `?${queryString}` : ''}`);
  }

  async getTimeSlots(offeringId: number): Promise<string[]> {
    return this.request<string[]>(`/offerings/${offeringId}/slots/`);
  }

  async createOffering(offering: {
    master_id: number;
    service_id: number;
    price: number;
    duration: string;
  }): Promise<Offering> {
    return this.request<Offering>('/offerings/', {
      method: 'POST',
      body: JSON.stringify(offering),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  // Add update offering method
  async updateOffering(offeringId: number, offering: {
    master_id: number;
    service_id: number;
    price: number;
    duration: string;
  }): Promise<Offering> {
    return this.request<Offering>(`/offerings/${offeringId}/`, {
      method: 'PUT',
      body: JSON.stringify(offering),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  // Add delete offering method
  async deleteOffering(offeringId: number): Promise<void> {
    return this.request<void>(`/offerings/${offeringId}/`, {
      method: 'DELETE',
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  // Product management
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/', {
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async createProduct(product: {
    name: string;
    price: number;
    quantity: number;
    unit: string;
  }): Promise<Product> {
    return this.request<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async updateProduct(productId: number, product: {
    name?: string;
    price?: number;
    quantity?: number;
    unit?: string;
  }): Promise<Product> {
    return this.request<Product>(`/products/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify(product),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async deleteProduct(productId: number): Promise<void> {
    return this.request<void>(`/products/${productId}/`, {
      method: 'DELETE',
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  // Cash Register management
  async getTransactions(startDate?: string, endDate?: string, transactionType?: string): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (transactionType) params.append('transaction_type', transactionType);

    const queryString = params.toString();
    return this.request<Transaction[]>(`/cash-register/transactions/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async createTransaction(transaction: {
    offering_id?: number | null;
    product_id?: number | null;
    product_quantity_used?: number | null;
    overtime_amount?: number | null;
    total_amount: number;
    transaction_type: string;
    transaction_date: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/cash-register/transactions/', {
      method: 'POST',
      body: JSON.stringify(transaction),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async getCashSummary(summaryDate?: string): Promise<CashSummary> {
    const params = new URLSearchParams();
    if (summaryDate) params.append('summary_date', summaryDate);

    const queryString = params.toString();
    return this.request<CashSummary>(`/cash-register/summary/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async getCashSummaryRange(startDate: string, endDate: string): Promise<CashSummary[]> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    const queryString = params.toString();
    return this.request<CashSummary[]>(`/cash-register/summary-range/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async collectMoney(amount: number, transactionDate?: string, notes?: string): Promise<Transaction> {
    console.log('COLLECT MONEY: Sending request', { amount, transactionDate, notes });
    const result = await this.request<Transaction>('/cash-register/collect/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        transaction_date: transactionDate,
        notes: notes
      }),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
    console.log('COLLECT MONEY: Response received', result);
    return result;
  }

  async withdrawMoney(amount: number, transactionDate?: string): Promise<Transaction> {
    console.log('WITHDRAW MONEY: Sending request', { amount, transactionDate });
    const result = await this.request<Transaction>('/cash-register/withdraw/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        transaction_date: transactionDate
      }),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
    console.log('WITHDRAW MONEY: Response received', result);
    return result;
  }

  async depositMoney(amount: number, transactionDate?: string): Promise<Transaction> {
    console.log('DEPOSIT MONEY: Sending request', { amount, transactionDate });
    const result = await this.request<Transaction>('/cash-register/deposit/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        transaction_date: transactionDate
      }),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
    console.log('DEPOSIT MONEY: Response received', result);
    return result;
  }

  async deleteTransaction(transactionId: number): Promise<void> {
    return this.request<void>(`/cash-register/transactions/${transactionId}/`, {
      method: 'DELETE',
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  // Appointment management
  async getAppointments(date?: string, confirmed?: boolean): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (confirmed !== undefined) params.append('confirmed', confirmed.toString());

    const query = params.toString();
    return this.request<Appointment[]>(`/appointments/${query ? `?${query}` : ''}`, {
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async adminCreateAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/appointments/admin_create/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }

  async deleteAppointment(appointmentId: number): Promise<void> {
    return this.request<void>(`/appointments/${appointmentId}/`, {
      method: 'DELETE',
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }
  
  async uploadMasterPhoto(masterId: number, file: File): Promise<Master> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<Master>(`/masters/${masterId}/photo/`, {
      method: "POST",
      body: formData,
    });
  }

  async confirmAppointment(appointmentId: number): Promise<{ message: string }> {
    // This would be an admin confirmation endpoint
    return this.request<{ message: string }>(`/appointments/${appointmentId}/admin_confirm/`, {
      method: 'POST',
      headers: {
        'Auth-Token': this.authToken || '',
      },
    });
  }
}

export const adminApiService = new AdminApiService();