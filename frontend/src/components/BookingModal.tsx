import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Star, CheckCircle, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedMaster, setSelectedMaster] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { toast } = useToast();

  const services = [
    {
      id: 1,
      name: "Классический маникюр",
      price: "2500 сом",
      duration: "1.5 часа",
      category: "Маникюр",
    },
    {
      id: 2,
      name: "Стрижка + укладка",
      price: "3000 сом",
      duration: "2 часа",
      category: "Волосы",
    },
    {
      id: 3,
      name: "Окрашивание волос",
      price: "5000 сом",
      duration: "3 часа",
      category: "Волосы",
    },
    {
      id: 4,
      name: "Педикюр SPA",
      price: "3500 сом",
      duration: "1.5 часа",
      category: "Педикюр",
    },
    {
      id: 5,
      name: "Макияж",
      price: "2000 сом",
      duration: "1 час",
      category: "Красота",
    },
    {
      id: 6,
      name: "Наращивание ресниц",
      price: "4000 сом",
      duration: "2 часа",
      category: "Красота",
    }
  ];

  const masters = [
    {
      id: 1,
      name: "Анна Петрова",
      specialization: "Топ-стилист",
      rating: 4.9,
      services: ["Стрижка + укладка", "Окрашивание волос"],
      avatar: "/lovable-uploads/2734627b-407b-493f-acaf-78dcb3a69db3.png"
    },
    {
      id: 2,
      name: "Мария Иванова",
      specialization: "Мастер маникюра",
      rating: 4.8,
      services: ["Классический маникюр", "Педикюр SPA"],
      avatar: "/lovable-uploads/e55fa9a4-f93f-46f1-a3ef-3ad70b67864c.png"
    },
    {
      id: 3,
      name: "Елена Смирнова",
      specialization: "Визажист",
      rating: 4.9,
      services: ["Макияж", "Наращивание ресниц"],
      avatar: "/lovable-uploads/3a7e4b26-a301-4446-81f5-e610ffe7bcb8.png"
    }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

  const getAvailableMasters = () => {
    if (!selectedService) return masters;
    return masters.filter(master => 
      master.services.includes(selectedService.name)
    );
  };

  const handleConfirmBooking = () => {
    toast({
      title: "Запись подтверждена!",
      description: `${clientName}, мы свяжемся с вами по номеру ${clientPhone} для подтверждения записи на ${selectedService.name}.`,
    });
    onClose();
    // Reset form
    setCurrentStep(0);
    setClientName("");
    setClientPhone("");
    setSelectedService(null);
    setSelectedMaster(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return clientName.trim() !== '' && clientPhone.trim() !== '';
      case 1: return selectedService !== null;
      case 2: return selectedMaster !== null;
      case 3: return selectedDate !== '' && selectedTime !== '';
      case 4: return true;
      default: return false;
    }
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
                    Ваше имя
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Введите ваше имя"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    Номер телефона
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+996 (___) ___-___"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                  />
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
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-soft ${
                      selectedService?.id === service.id 
                        ? 'border-primary bg-blush/30' 
                        : 'border-primary/10'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {service.category}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="font-semibold text-primary">{service.price}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Master */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите мастера</h3>
              <div className="space-y-4">
                {getAvailableMasters().map((master) => (
                  <Card 
                    key={master.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-soft ${
                      selectedMaster?.id === master.id 
                        ? 'border-primary bg-blush/30' 
                        : 'border-primary/10'
                    }`}
                    onClick={() => setSelectedMaster(master)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={master.avatar} 
                          alt={master.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-rose-gold/30"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{master.name}</h4>
                          <p className="text-muted-foreground text-sm">{master.specialization}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span className="text-sm font-medium">{master.rating}</span>
                          </div>
                        </div>
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите дату и время</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm sm:text-base">Дата:</h4>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <Button
                        key={dateStr}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-12 flex flex-col ${
                          isSelected ? 'bg-primary' : 'hover:bg-blush'
                        }`}
                      >
                        <span className="text-xs">
                          {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                        </span>
                        <span className="font-semibold">
                          {date.getDate()}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-3">Время:</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={`h-8 sm:h-10 text-xs sm:text-sm ${
                          selectedTime === time ? 'bg-primary' : 'hover:bg-blush'
                        }`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
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
                    <span className="font-semibold text-sm sm:text-base">{selectedMaster?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Дата:</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {new Date(selectedDate).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Время:</span>
                    <span className="font-semibold text-sm sm:text-base">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Длительность:</span>
                    <span className="font-semibold text-sm sm:text-base">{selectedService?.duration}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 sm:pt-4">
                    <span className="text-base sm:text-lg font-semibold">Стоимость:</span>
                    <span className="text-lg sm:text-xl font-bold text-primary">{selectedService?.price}</span>
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
            disabled={currentStep === 0}
            className="border-primary/20 w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-gradient-primary w-full sm:w-auto order-1 sm:order-2"
            >
              Далее
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirmBooking}
              className="bg-gradient-primary w-full sm:w-auto order-1 sm:order-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Подтвердить запись
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;