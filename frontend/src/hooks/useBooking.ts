import { useState, useCallback } from 'react';
import { apiService, Service, Offering, Appointment, AppointmentRequest } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface BookingState {
  // Шаг 1: Контактные данные
  clientName: string;
  clientPhone: string;
  
  // Шаг 2: Услуги
  services: Service[];
  selectedService: Service | null;
  
  // Шаг 3: Офферинги (мастера)
  offerings: Offering[];
  selectedOffering: Offering | null;
  
  // Шаг 4: Время
  availableSlots: string[];
  selectedSlot: string | null;
  
  // Общее состояние
  loading: boolean;
  error: string | null;
  currentStep: number;
  createdAppointment: Appointment | null;
}

const initialState: BookingState = {
  clientName: '',
  clientPhone: '+',
  services: [],
  selectedService: null,
  offerings: [],
  selectedOffering: null,
  availableSlots: [],
  selectedSlot: null,
  loading: false,
  error: null,
  currentStep: 0,
  createdAppointment: null,
};

export const useBooking = () => {
  const [state, setState] = useState<BookingState>(initialState);
  const { toast } = useToast();

  const updateState = useCallback((updates: Partial<BookingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading });
  }, [updateState]);

  const setError = useCallback((error: string | null) => {
    updateState({ error });
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error,
      });
    }
  }, [updateState, toast]);

  // Шаг 1: Обновление контактных данных
  const updateContactInfo = useCallback((name: string, phone: string) => {
    updateState({ clientName: name, clientPhone: phone });
  }, [updateState]);

  // Шаг 2: Загрузка услуг
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const services = await apiService.getServices();
      updateState({ services });
    } catch (error) {
      setError('Не удалось загрузить список услуг');
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  const selectService = useCallback((service: Service) => {
    updateState({ 
      selectedService: service,
      selectedOffering: null,
      offerings: [],
      availableSlots: [],
      selectedSlot: null
    });
  }, [updateState]);

  // Шаг 3: Загрузка офферингов (мастеров)
  const loadOfferings = useCallback(async (serviceId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const offerings = await apiService.getOfferings(serviceId);
      updateState({ offerings });
    } catch (error) {
      setError('Не удалось загрузить список мастеров');
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  const selectOffering = useCallback((offering: Offering) => {
    updateState({ 
      selectedOffering: offering,
      availableSlots: [],
      selectedSlot: null
    });
  }, [updateState]);

  // Шаг 4: Загрузка доступных слотов времени
  const loadTimeSlots = useCallback(async (offeringId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const slots = await apiService.getTimeSlots(offeringId);
      updateState({ availableSlots: slots });
    } catch (error) {
      setError('Не удалось загрузить доступные время');
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  const selectTimeSlot = useCallback((slot: string) => {
    updateState({ selectedSlot: slot });
  }, [updateState]);

  // Шаг 5: Создание записи
  const createAppointment = useCallback(async () => {
    if (!state.selectedOffering || !state.selectedSlot) {
      setError('Не все данные для записи заполнены');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData: AppointmentRequest = {
        name: state.clientName,
        phone: state.clientPhone,
        offering_id: state.selectedOffering.id,
        datetime: state.selectedSlot,
      };

      const appointment = await apiService.createAppointment(appointmentData);
      updateState({ createdAppointment: appointment });
      
      toast({
        title: "Запись создана!",
        description: "Вам был отправлен код подтверждения",
      });

      return appointment;
    } catch (error) {
      setError('Не удалось создать запись');
      console.error('Error creating appointment:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state, setLoading, setError, updateState, toast]);

  // Подтверждение записи
  const confirmAppointment = useCallback(async (appointmentId: number, confirmationCode: string) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.confirmAppointment(appointmentId, confirmationCode);
      
      toast({
        title: "Запись подтверждена!",
        description: "Ваша запись успешно подтверждена",
      });

      return true;
    } catch (error) {
      setError('Неверный код подтверждения');
      console.error('Error confirming appointment:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, toast]);

  // Обновление кода подтверждения
  const refreshConfirmationCode = useCallback(async (appointmentId: number) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.refreshConfirmationCode(appointmentId);
      
      toast({
        title: "Код отправлен",
        description: "Новый код подтверждения отправлен",
      });

      return true;
    } catch (error) {
      setError('Не удалось отправить код подтверждения');
      console.error('Error refreshing confirmation code:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, toast]);

  // Навигация по шагам
  const nextStep = useCallback(() => {
    if (state.currentStep < 4) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  }, [state.currentStep, updateState]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  }, [state.currentStep, updateState]);

  const setStep = useCallback((step: number) => {
    updateState({ currentStep: step });
  }, [updateState]);

  // Валидация шагов
  const isStepValid = useCallback(() => {
    switch (state.currentStep) {
      case 0: // Контактные данные
        return state.clientName.trim().length >= 2 && 
               state.clientName.trim().length <= 100 &&
               state.clientPhone.trim().length >= 3 && 
               state.clientPhone.trim().length <= 20 &&
               state.clientPhone.startsWith('+');
      case 1: // Выбор услуги
        return state.selectedService !== null;
      case 2: // Выбор мастера
        return state.selectedOffering !== null;
      case 3: // Выбор времени
        return state.selectedSlot !== null;
      case 4: // Подтверждение
        return true;
      default:
        return false;
    }
  }, [state]);

  // Сброс состояния
  const resetBooking = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // Состояние
    ...state,
    
    // Действия
    updateContactInfo,
    loadServices,
    selectService,
    loadOfferings,
    selectOffering,
    loadTimeSlots,
    selectTimeSlot,
    createAppointment,
    confirmAppointment,
    refreshConfirmationCode,
    
    // Навигация
    nextStep,
    prevStep,
    setStep,
    isStepValid,
    
    // Утилиты
    resetBooking,
  };
};