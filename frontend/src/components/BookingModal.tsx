import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Star, CheckCircle, ArrowLeft, ArrowRight, Phone, Loader2 } from "lucide-react";
import { useBooking } from "@/hooks/useBooking";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  
  const {
    // Состояние
    clientName,
    clientPhone,
    services,
    selectedService,
    offerings,
    selectedOffering,
    availableSlots,
    selectedSlot,
    loading,
    error,
    currentStep,
    createdAppointment,
    
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
    isStepValid,
    resetBooking,
  } = useBooking();

  // Загрузка услуг при открытии модала
  useEffect(() => {
    if (isOpen && currentStep === 1 && services.length === 0) {
      loadServices();
    }
  }, [isOpen, currentStep, services.length, loadServices]);

  // Загрузка офферингов при выборе услуги
  useEffect(() => {
    if (selectedService && currentStep === 2) {
      loadOfferings(selectedService.id);
    }
  }, [selectedService, currentStep, loadOfferings]);

  // Загрузка слотов времени при выборе оффера
  useEffect(() => {
    if (selectedOffering && currentStep === 3) {
      loadTimeSlots(selectedOffering.id);
    }
  }, [selectedOffering, currentStep, loadTimeSlots]);

  // Форматирование длительности из HH:MM:SS в читаемый вид
  const formatDuration = (duration: string) => {
    const [hours, minutes] = duration.split(':');
    const h = parseInt(hours);
    const m = parseInt(minutes);
    
    if (h > 0 && m > 0) {
      return `${h} ч ${m} мин`;
    } else if (h > 0) {
      return `${h} ч`;
    } else {
      return `${m} мин`;
    }
  };

  // Форматирование времени из ISO строки
  const formatSlotTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Bishkek'
    });
  };

  // Форматирование даты из ISO строки
  const formatSlotDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Bishkek'
    });
  };

  const handleConfirmBooking = async () => {
    const appointment = await createAppointment();
    if (appointment) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
    resetBooking();
  };

  const handleNameChange = (value: string) => {
    updateContactInfo(value, clientPhone);
  };

  const handlePhoneChange = (value: string) => {
    // Ensure phone always starts with + and cannot be removed
    let formattedValue = value;
    
    // If user tries to remove +, add it back
    if (!formattedValue.startsWith('+')) {
      formattedValue = '+' + formattedValue.replace(/^\+*/, '');
    }
    
    // Limit to 20 characters total
    if (formattedValue.length > 20) {
      formattedValue = formattedValue.substring(0, 20);
    }
    
    updateContactInfo(clientName, formattedValue);
  };

  const handleServiceSelect = (service: any) => {
    selectService(service);
  };

  const handleOfferingSelect = (offering: any) => {
    selectOffering(offering);
  };

  const handleSlotSelect = (slot: string) => {
    selectTimeSlot(slot);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Онлайн запись
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
            {[0, 1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  ${step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step < currentStep ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step + 1}
                </div>
                {step < 4 && (
                  <div className={`w-4 sm:w-8 h-1 mx-1 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 0: Contact Information */}
          {currentStep === 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    Ваше имя (2-100 символов)
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Введите ваше имя"
                    value={clientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                    minLength={2}
                    maxLength={100}
                  />
                  {clientName.length > 0 && (clientName.length < 2 || clientName.length > 100) && (
                    <p className="text-sm text-red-500">Имя должно содержать от 2 до 100 символов</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    Номер телефона (3-20 символов)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+"
                    value={clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                    minLength={3}
                    maxLength={20}
                  />
                  {clientPhone.length > 0 && (clientPhone.length < 3 || clientPhone.length > 20 || !clientPhone.startsWith('+')) && (
                    <p className="text-sm text-red-500">Номер телефона должен начинаться с + и содержать от 3 до 20 символов</p>
                  )}
                </div>

                <div className="text-sm text-muted-foreground bg-blush/20 p-3 rounded-lg">
                  <p>Далее вы сможете выбрать услугу, мастера и удобное время для записи.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите услугу</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2">Загрузка услуг...</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card 
                      key={service.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-soft ${
                        selectedService?.id === service.id 
                          ? 'border-primary bg-blush/30' 
                          : 'border-primary/10'
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Выберите эту услугу для просмотра доступных мастеров
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Master */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите мастера</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2">Загрузка мастеров...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {offerings.map((offering) => (
                    <Card 
                      key={offering.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-soft ${
                        selectedOffering?.id === offering.id 
                          ? 'border-primary bg-blush/30' 
                          : 'border-primary/10'
                      }`}
                      onClick={() => handleOfferingSelect(offering)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-lg">
                            {offering.master.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{offering.master.name}</h4>
                            <p className="text-muted-foreground text-sm">{offering.master.specialization || 'Мастер'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(offering.duration)}</span>
                              </div>
                              <div className="font-semibold text-primary">{offering.price} сом</div>
                            </div>
                            {offering.master.rating && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 fill-accent text-accent" />
                                <span className="text-sm font-medium">{offering.master.rating}</span>
                              </div>
                            )}
                          </div>
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {offerings.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Мастера для данной услуги не найдены</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите время</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2">Загрузка доступного времени...</span>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-3">Доступное время:</h4>
                  
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        const slotDate = formatSlotDate(slot);
                        const slotTime = formatSlotTime(slot);
                        
                        return (
                          <Button
                            key={slot}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSlotSelect(slot)}
                            className={`h-16 flex flex-col ${
                              isSelected ? 'bg-primary' : 'hover:bg-blush'
                            }`}
                          >
                            <span className="text-xs opacity-80">
                              {slotDate}
                            </span>
                            <span className="font-semibold">
                              {slotTime}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>На ближайшее время нет доступных слотов</p>
                      <p className="text-sm">Попробуйте выбрать другого мастера</p>
                    </div>
                  )}
                  
                  {selectedSlot && (
                    <div className="mt-4 p-3 bg-blush/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Выбранное время:</p>
                      <p className="font-semibold">
                        {new Date(selectedSlot).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Bishkek'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Подтверждение записи</h3>
              <Card className="bg-gradient-to-br from-blush/20 to-champagne/20 border-primary/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Имя:</span>
                    <span className="font-semibold text-sm sm:text-base">{clientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Телефон:</span>
                    <span className="font-semibold text-sm sm:text-base">{clientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Услуга:</span>
                    <span className="font-semibold text-sm sm:text-base">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Мастер:</span>
                    <span className="font-semibold text-sm sm:text-base">{selectedOffering?.master.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Время:</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {selectedSlot && new Date(selectedSlot).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Bishkek'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Длительность:</span>
                    <span className="font-semibold text-sm sm:text-base">{selectedOffering && formatDuration(selectedOffering.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 sm:pt-4">
                    <span className="text-base sm:text-lg font-semibold">Стоимость:</span>
                    <span className="text-lg sm:text-xl font-bold text-primary">{selectedOffering?.price} сом</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || loading}
            className="border-primary/20 w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid() || loading}
              className="bg-gradient-primary w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  Далее
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="bg-gradient-primary w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Подтвердить запись
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        appointment={createdAppointment}
        onConfirm={confirmAppointment}
        onRefreshCode={refreshConfirmationCode}
        loading={loading}
      />
    </Dialog>
  );
};

export default BookingModal;