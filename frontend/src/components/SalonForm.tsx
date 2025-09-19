import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  logo?: string;
  photos: string[];
}

interface SalonFormProps {
  salon?: Salon;
  onSave: (salon: Salon | Omit<Salon, "id">) => void;
}

export const SalonForm = ({ salon, onSave }: SalonFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: salon?.name || "",
    address: salon?.address || "",
    phone: salon?.phone || "",
    description: salon?.description || "",
    logo: salon?.logo || "",
    photos: salon?.photos || []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = () => {
    // Симуляция загрузки файла
    const mockUrls = [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=100&h=100&fit=crop"
    ];
    
    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setFormData(prev => ({
      ...prev,
      logo: randomUrl
    }));
    
    toast({
      title: "Логотип загружен",
      description: "Изображение успешно добавлено"
    });
  };

  const handlePhotoUpload = () => {
    // Симуляция загрузки фотографий
    const mockUrls = [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"
    ];
    
    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, randomUrl]
    }));
    
    toast({
      title: "Фото добавлено",
      description: "Изображение успешно загружено в галерею"
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните обязательные поля",
        variant: "destructive"
      });
      return;
    }

    if (salon) {
      onSave({ ...formData, id: salon.id });
    } else {
      onSave(formData);
    }
    
    toast({
      title: salon ? "Салон обновлен" : "Салон создан",
      description: salon ? "Данные салона успешно обновлены" : "Новый салон успешно создан"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Название салона *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Введите название салона"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="+996 (XXX) XXX-XXX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Адрес *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="г. Бишкек, ул. Название, дом"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Краткое описание салона и услуг"
          rows={3}
        />
      </div>

      {/* Логотип */}
      <div className="space-y-4">
        <Label>Логотип салона</Label>
        
        {formData.logo ? (
          <Card className="w-32">
            <CardContent className="p-4">
              <div className="relative">
                <img 
                  src={formData.logo} 
                  alt="Логотип"
                  className="w-full h-20 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleLogoUpload}
            className="w-32 h-24 border-dashed gap-2"
          >
            <Upload className="h-4 w-4" />
            Загрузить
          </Button>
        )}
      </div>

      {/* Фотографии */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Фотографии салона ({formData.photos.length}/10)</Label>
          {formData.photos.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePhotoUpload}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Добавить фото
            </Button>
          )}
        </div>
        
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.photos.map((photo, index) => (
              <Card key={index}>
                <CardContent className="p-2">
                  <div className="relative">
                    <img 
                      src={photo} 
                      alt={`Фото ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {salon ? "Сохранить изменения" : "Создать салон"}
        </Button>
      </div>
    </form>
  );
};