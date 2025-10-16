import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatPhoneNumber, isValidPhoneNumber } from '@/utils/phone';

// Define the settings interface
interface SalonSettings {
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonDescription: string;
}

// Default settings
const DEFAULT_SETTINGS: SalonSettings = {
  salonName: 'Beauty Salon',
  salonAddress: 'г. Бишкек, пр. Чуй, 168',
  salonPhone: '+996 (312) 62-45-67',
  salonDescription: 'Ваша красота - наша страсть',
};

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SalonSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('salonSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  const handleChange = (field: keyof SalonSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate phone number if provided
    if (settings.salonPhone && !isValidPhoneNumber(settings.salonPhone)) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите корректный номер телефона (+7 или +996)',
        variant: 'destructive',
      });
      return;
    }
    
    // Save settings to localStorage
    localStorage.setItem('salonSettings', JSON.stringify(settings));
    
    toast({
      title: 'Настройки сохранены',
      description: 'Ваши настройки успешно сохранены',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Управление системными настройками
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о салоне</CardTitle>
            <CardDescription>
              Основная информация о вашем салоне красоты
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salon-name">Название салона</Label>
              <Input
                id="salon-name"
                value={settings.salonName}
                onChange={(e) => handleChange('salonName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salon-address">Адрес</Label>
              <Input
                id="salon-address"
                value={settings.salonAddress}
                onChange={(e) => handleChange('salonAddress', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salon-phone">Телефон</Label>
              <Input
                id="salon-phone"
                value={settings.salonPhone}
                onChange={(e) => handleChange('salonPhone', formatPhoneNumber(e.target.value) || e.target.value)}
                placeholder="+7 или +996XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salon-description">Описание</Label>
              <Textarea
                id="salon-description"
                value={settings.salonDescription}
                onChange={(e) => handleChange('salonDescription', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}