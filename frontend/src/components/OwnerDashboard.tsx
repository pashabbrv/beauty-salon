import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, Edit, Trash2, Camera, MapPin, Phone, FileText } from "lucide-react";
import { SalonForm } from "@/components/SalonForm";
import { PhotoManager } from "@/components/PhotoManager";

// Типы для данных салона
interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  logo?: string;
  photos: string[];
}

const OwnerDashboard = () => {
  const [salons, setSalons] = useState<Salon[]>([
    {
      id: "1",
      name: "Красота & Стиль",
      address: "ул. Чуй, 123, г. Бишкек",
      phone: "+996 (555) 123-456",
      description: "Современный салон красоты с полным спектром услуг",
      logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop",
      photos: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop"
      ]
    }
  ]);

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  const handleCreateSalon = (salonData: Omit<Salon, "id">) => {
    const newSalon: Salon = {
      ...salonData,
      id: Date.now().toString()
    };
    setSalons([...salons, newSalon]);
    setIsCreating(false);
  };

  const handleUpdateSalon = (updatedSalon: Salon) => {
    setSalons(salons.map(salon => 
      salon.id === updatedSalon.id ? updatedSalon : salon
    ));
    setSelectedSalon(updatedSalon);
  };

  const handleDeleteSalon = (salonId: string) => {
    setSalons(salons.filter(salon => salon.id !== salonId));
    if (selectedSalon?.id === salonId) {
      setSelectedSalon(null);
      setShowPhotos(false);
    }
  };

  const handleUpdatePhotos = (photos: string[]) => {
    if (selectedSalon) {
      const updatedSalon = { ...selectedSalon, photos };
      handleUpdateSalon(updatedSalon);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsCreating(true)} 
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Создать салон
          </Button>
          <Badge variant="secondary">
            {salons.length} {salons.length === 1 ? 'салон' : 'салонов'}
          </Badge>
        </div>
      </div>

      {/* Форма создания нового салона */}
      {isCreating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Создать новый салон</CardTitle>
              <Button 
                variant="ghost" 
                onClick={() => setIsCreating(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SalonForm onSave={handleCreateSalon} />
          </CardContent>
        </Card>
      )}

      {/* Список салонов */}
      {salons.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">У вас пока нет салонов</h3>
            <p className="text-muted-foreground mb-6">
              Создайте свой первый салон, чтобы начать работу
            </p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Создать первый салон
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {salon.logo && (
                      <img 
                        src={salon.logo} 
                        alt={salon.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{salon.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {salon.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {salon.phone}
                        </div>
                      </div>
                      {salon.description && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {salon.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Camera className="h-3 w-3" />
                      {salon.photos.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSalon(salon.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Редактирование данных */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Редактировать данные
                    </h4>
                    
                    {selectedSalon?.id === salon.id && !showPhotos ? (
                      <div className="space-y-4">
                        <SalonForm 
                          salon={selectedSalon} 
                          onSave={handleUpdateSalon} 
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedSalon(null)}
                          className="w-full"
                        >
                          Отменить
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSelectedSalon(salon);
                          setShowPhotos(false);
                        }}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Редактировать
                      </Button>
                    )}
                  </div>

                  {/* Управление фотографиями */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Управление фото
                    </h4>
                    
                    {selectedSalon?.id === salon.id && showPhotos ? (
                      <div className="space-y-4">
                        <PhotoManager 
                          photos={selectedSalon.photos}
                          onUpdatePhotos={handleUpdatePhotos}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedSalon(null);
                            setShowPhotos(false);
                          }}
                          className="w-full"
                        >
                          Закрыть
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSelectedSalon(salon);
                          setShowPhotos(true);
                        }}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Управлять фото
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </main>
  );
};

export default OwnerDashboard;