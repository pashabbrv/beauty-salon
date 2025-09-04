import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw, Phone } from "lucide-react";
import { Appointment } from "@/services/api";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirm: (appointmentId: number, code: string) => Promise<boolean>;
  onRefreshCode: (appointmentId: number) => Promise<boolean>;
  loading: boolean;
}

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onConfirm, 
  onRefreshCode, 
  loading 
}: ConfirmationModalProps) => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);

  const handleConfirm = async () => {
    if (!appointment) return;
    
    const success = await onConfirm(appointment.id, confirmationCode);
    if (success) {
      setConfirmationCode("");
      onClose();
    } else {
      setIsCodeValid(false);
    }
  };

  const handleRefreshCode = async () => {
    if (!appointment) return;
    
    await onRefreshCode(appointment.id);
    setConfirmationCode("");
    setIsCodeValid(true);
  };

  const handleCodeChange = (value: string) => {
    setConfirmationCode(value);
    setIsCodeValid(true);
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Подтверждение записи
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о записи */}
          <Card className="bg-blush/20 border-primary/10">
            <CardContent className="p-4 space-y-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Запись создана</p>
                <p className="font-semibold">{appointment.offering.service.name}</p>
                <p className="text-sm">Мастер: {appointment.offering.master.name}</p>
                <p className="text-sm">
                  {new Date(appointment.slot.start).toLocaleDateString('ru-RU', {
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
            </CardContent>
          </Card>

          {/* Ввод кода подтверждения */}
          <div className="space-y-4">
            <div className="text-center">
              <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                Код подтверждения отправлен на номер
              </p>
              <p className="font-semibold">{appointment.phone}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                placeholder="Введите код"
                value={confirmationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`text-center text-lg tracking-wider ${
                  !isCodeValid ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                }`}
                maxLength={8}
              />
              {!isCodeValid && (
                <p className="text-sm text-red-500">Неверный код подтверждения</p>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Button
              onClick={handleConfirm}
              disabled={loading || confirmationCode.length < 2}
              className="w-full bg-gradient-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {loading ? "Подтверждаем..." : "Подтвердить запись"}
            </Button>

            <Button
              variant="outline"
              onClick={handleRefreshCode}
              disabled={loading}
              className="w-full border-primary/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Отправить код повторно
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;