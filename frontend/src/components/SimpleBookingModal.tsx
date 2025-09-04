import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleBookingModal = ({ isOpen, onClose }: SimpleBookingModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+");
  const { toast } = useToast();

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
    
    setPhone(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    // Simulate booking submission
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время для подтверждения записи.",
    });

    // Reset form and close modal
    setName("");
    setPhone("+");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary" />
            Записаться на услугу
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="text-sm text-muted-foreground bg-blush/20 p-3 rounded-lg">
            <p>Наш администратор свяжется с вами для выбора услуги, мастера и времени записи.</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-primary/20"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              Отправить заявку
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBookingModal;