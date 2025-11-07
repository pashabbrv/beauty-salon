import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Phone, Scissors, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, isValidPhoneNumber } from "@/utils/phone";
import { adminApiService, Service, Master, Offering } from "@/services/api";

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

const AdminBookingModal = ({ isOpen, onClose, onBookingCreated }: AdminBookingModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+");
  const [serviceId, setServiceId] = useState<string>("");
  const [masterId, setMasterId] = useState<string>("");
  const [offeringId, setOfferingId] = useState<string>("");
  const [datetime, setDatetime] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: client info, 2: service selection, 3: time selection
  const { toast } = useToast();

  // Load services and masters when modal opens
  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadMasters();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setPhone("+");
    setServiceId("");
    setMasterId("");
    setOfferingId("");
    setDatetime("");
    setStep(1);
    setOfferings([]);
    setAvailableSlots([]);
  };

  const loadServices = async () => {
    try {
      const data = await adminApiService.getServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to load services:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список услуг",
        variant: "destructive",
      });
    }
  };

  const loadMasters = async () => {
    try {
      const data = await adminApiService.getMasters();
      setMasters(data);
    } catch (error) {
      console.error("Failed to load masters:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список мастеров",
        variant: "destructive",
      });
    }
  };

  const loadOfferings = async () => {
    if (!serviceId && !masterId) {
      // If no filters, load all offerings
      try {
        const data = await adminApiService.getOfferings();
        setOfferings(data);
      } catch (error) {
        console.error("Failed to load offerings:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список услуг мастеров",
          variant: "destructive",
        });
      }
      return;
    }
    
    try {
      const data = await adminApiService.getOfferings(
        serviceId ? parseInt(serviceId) : undefined,
        masterId ? parseInt(masterId) : undefined
      );
      setOfferings(data);
    } catch (error) {
      console.error("Failed to load offerings:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список услуг мастеров",
        variant: "destructive",
      });
    }
  };

  const loadAvailableSlots = async () => {
    if (!offeringId) return;
    
    try {
      const data = await adminApiService.getTimeSlots(parseInt(offeringId));
      setAvailableSlots(data);
    } catch (error) {
      console.error("Failed to load time slots:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить доступное время",
        variant: "destructive",
      });
    }
  };

  // Load offerings when service or master is selected
  useEffect(() => {
    loadOfferings();
  }, [serviceId, masterId]);

  // Load available slots when offering is selected
  useEffect(() => {
    if (offeringId) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setDatetime("");
    }
  }, [offeringId]);

  const handlePhoneChange = (value: string) => {
    // Format the phone number
    const formattedValue = formatPhoneNumber(value) || value;
    setPhone(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !isValidPhoneNumber(phone)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректный номер телефона (+7 или +996)",
        variant: "destructive",
      });
      return;
    }

    if (!offeringId || !datetime) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите услугу и время записи",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await adminApiService.adminCreateAppointment({
        name,
        phone,
        offering_id: parseInt(offeringId),
        datetime
      });
      
      toast({
        title: "Запись создана!",
        description: "Запись клиента успешно создана и подтверждена.",
      });

      // Reset form and close modal
      resetForm();
      onBookingCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать запись. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name.trim() || !phone.trim() || !isValidPhoneNumber(phone))) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректные данные клиента",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary" />
            Создать запись клиента
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Client Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Информация о клиенте</h3>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Имя клиента
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Введите имя клиента"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  placeholder="+"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
              
              <Button type="button" onClick={nextStep} className="w-full mt-4">
                Далее
              </Button>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Выбор услуги</h3>
              
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-medium flex items-center">
                  <Scissors className="w-4 h-4 mr-2 text-primary" />
                  Услуга
                </Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите услугу" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="master" className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Мастер (опционально)
                </Label>
                <Select value={masterId} onValueChange={setMasterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите мастера" />
                  </SelectTrigger>
                  <SelectContent>
                    {masters.map((master) => (
                      <SelectItem key={master.id} value={master.id.toString()}>
                        {master.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {offerings.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="offering" className="text-sm font-medium">
                    Услуга мастера
                  </Label>
                  <Select value={offeringId} onValueChange={setOfferingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите услугу мастера" />
                    </SelectTrigger>
                    <SelectContent>
                      {offerings.map((offering) => (
                        <SelectItem key={offering.id} value={offering.id.toString()}>
                          {offering.service.name} - {offering.master.name} ({offering.price} сом)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Назад
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="flex-1"
                  disabled={!offeringId}
                >
                  Далее
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Выбор времени</h3>
              
              {availableSlots.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    Доступное время
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={datetime === slot ? "default" : "outline"}
                        onClick={() => setDatetime(slot)}
                        className="text-xs"
                      >
                        {new Date(slot).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Нет доступного времени для выбранной услуги
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Назад
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  disabled={loading || !datetime}
                >
                  {loading ? "Создание..." : "Создать запись"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBookingModal;