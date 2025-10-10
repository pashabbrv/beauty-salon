import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    salonName: 'Салон красоты',
    salonAddress: 'г. Бишкек, ул. Чуй, 123',
    salonPhone: '+996 (555) 123-456',
    salonDescription: 'Современный салон красоты с полным спектром услуг',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
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

      <div className="grid gap-6 md:grid-cols-2">
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
                onChange={(e) => handleChange('salonPhone', e.target.value)}
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

        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>
              Настройки уведомлений для клиентов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Включить или отключить уведомления
                </p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => handleChange('notificationsEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Отправлять уведомления по электронной почте
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                disabled={!settings.notificationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>SMS уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Отправлять уведомления по SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleChange('smsNotifications', checked)}
                disabled={!settings.notificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
          <CardDescription>
            Настройки безопасности и доступа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Текущий пароль</Label>
              <Input
                id="current-password"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}