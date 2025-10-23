import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'Все фото' },
    { id: 'interior', name: 'Интерьер' },
    { id: 'nails', name: 'Маникюр' },
    { id: 'hair', name: 'Стрижки' },
    { id: 'makeup', name: 'Макияж' },
  ];

  const galleryImages = [
    {
      id: 1,
      src: "/placeholder.svg",
      category: "interior",
      title: "Основной зал",
      description: "Современный интерьер салона красоты"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop",
      category: "interior",
      title: "Зона маникюра", 
      description: "Уютное место для ухода за ногтями"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
      category: "nails",
      title: "Элегантный маникюр",
      description: "Классический французский дизайн"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop",
      category: "nails",
      title: "Педикюр SPA",
      description: "Расслабляющие процедуры для ног"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop",
      category: "hair",
      title: "Стильное окрашивание",
      description: "Современная техника балаяж"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
      category: "hair", 
      title: "Модная стрижка",
      description: "Каскад с градуировкой"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop",
      category: "makeup",
      title: "Вечерний макияж",
      description: "Профессиональный образ для особого случая"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop",
      category: "makeup",
      title: "Наращивание ресниц",
      description: "Объемное наращивание 3D"
    }
  ];

  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeCategory);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background to-blush/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Галерея работ
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Посмотрите на результаты работы наших мастеров и атмосферу салона
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentImageIndex(0);
              }}
              className={`
                transition-all duration-300
                ${activeCategory === category.id 
                  ? "bg-gradient-primary shadow-soft" 
                  : "border-primary/20 hover:border-primary hover:bg-blush"
                }
              `}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Main Gallery */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Image */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-card shadow-elegant border-primary/10">
              <div className="relative group">
                <img 
                  src={filteredImages[currentImageIndex]?.src} 
                  alt={filteredImages[currentImageIndex]?.title}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Expand className="w-5 h-5" />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {filteredImages[currentImageIndex]?.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {filteredImages[currentImageIndex]?.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blush text-primary">
                    {categories.find(cat => cat.id === filteredImages[currentImageIndex]?.category)?.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thumbnail Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Другие работы</h3>
            <div className="grid grid-cols-2 gap-4">
              {filteredImages.slice(0, 6).map((image, index) => (
                <div 
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`
                    relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300
                    ${index === currentImageIndex 
                      ? "border-primary shadow-soft" 
                      : "border-transparent hover:border-primary/50"
                    }
                  `}
                >
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;