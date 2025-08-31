import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Trash2, Eye, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoManagerProps {
  photos: string[];
  onUpdatePhotos: (photos: string[]) => void;
}

export const PhotoManager = ({ photos, onUpdatePhotos }: PhotoManagerProps) => {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleUploadPhoto = () => {
    if (photos.length >= 10) {
      toast({
        title: "Лимит достигнут",
        description: "Максимальное количество фотографий: 10",
        variant: "destructive"
      });
      return;
    }

    // Симуляция загрузки фото
    const mockUrls = [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop"
    ];
    
    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    const newPhotos = [...photos, randomUrl];
    onUpdatePhotos(newPhotos);
    
    toast({
      title: "Фото добавлено",
      description: "Изображение успешно загружено"
    });
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onUpdatePhotos(newPhotos);
    
    toast({
      title: "Фото удалено",
      description: "Изображение удалено из галереи"
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Удаляем фото из старой позиции
    newPhotos.splice(draggedIndex, 1);
    // Вставляем в новую позицию
    newPhotos.splice(targetIndex, 0, draggedPhoto);
    
    onUpdatePhotos(newPhotos);
    setDraggedIndex(null);
    
    toast({
      title: "Порядок изменен",
      description: "Фотографии переупорядочены"
    });
  };

  return (
    <div className="space-y-6">
      {/* Статистика и кнопка загрузки */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {photos.length} из 10 фотографий
          </Badge>
          {photos.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Перетащите фото для изменения порядка
            </p>
          )}
        </div>
        
        <Button 
          onClick={handleUploadPhoto}
          disabled={photos.length >= 10}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Загрузить фото
        </Button>
      </div>

      {/* Галерея фотографий */}
      {photos.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <CardContent>
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Пока нет фотографий</h3>
            <p className="text-muted-foreground mb-4">
              Загрузите фотографии интерьера и работ салона
            </p>
            <Button onClick={handleUploadPhoto} className="gap-2">
              <Upload className="h-4 w-4" />
              Загрузить первое фото
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <Card 
              key={index}
              className="group cursor-move hover:shadow-lg transition-shadow"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img 
                    src={photo} 
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  
                  {/* Оверлей с кнопками */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedPhoto(photo)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePhoto(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Индикатор перетаскивания */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Номер фото */}
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 left-2 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог просмотра фото */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Просмотр фотографии</DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="relative">
              <img 
                src={selectedPhoto} 
                alt="Предпросмотр"
                className="w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};