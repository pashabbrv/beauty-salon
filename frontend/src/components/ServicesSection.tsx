import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ServiceCard from "./ServiceCard";
import { apiService, Service, Offering } from "@/services/api";

interface ServicesSectionProps {
  onBookingClick?: () => void;
  availableServices?: Service[];
}

const ServicesSection = ({ onBookingClick, availableServices }: ServicesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);

  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      // Convert availableServices to the format expected by the component
      const formattedServices = availableServices.map(service => ({
        id: service.id,
        title: service.name,
        description: "Профессиональная услуга", // Default description
        price: "от 1 000 сом", // Default price, will be updated with real data
        duration: "1 час", // Default duration, will be updated with real data
        category: "beauty", // Default category
        rating: 4.8, // Default rating
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop" // Default image
      }));
      setServices(formattedServices);
    } else {
      // Load default services if none provided
      loadDefaultServices();
    }
    
    // Load offerings to get real pricing and duration info
    loadOfferings();
  }, [availableServices]);

  const loadDefaultServices = () => {
    const defaultServices = [
      {
        id: 1,
        title: "Классический маникюр",
        description: "Профессиональный уход за ногтями с покрытием гель-лаком. Включает обработку кутикулы и массаж рук.",
        price: "от 2 500 сом",
        duration: "1.5 часа",
        category: "nails",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop"
      },
      {
        id: 2,
        title: "Стрижка + укладка",
        description: "Модная стрижка с последующей профессиональной укладкой. Консультация стилиста включена.",
        price: "от 3 000 сом",
        duration: "2 часа",
        category: "hair",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"
      },
      {
        id: 3,
        title: "Окрашивание волос",
        description: "Профессиональное окрашивание премиальными красками. Включает уход и восстановление волос.",
        price: "от 5 000 сом",
        duration: "3 часа",
        category: "hair",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop"
      },
      {
        id: 4,
        title: "Педикюр SPA",
        description: "Роскошный SPA-педикюр с парафинотерапией и расслабляющим массажем стоп.",
        price: "от 3 500 сом",
        duration: "1.5 часа",
        category: "nails",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop"
      },
      {
        id: 5,
        title: "Макияж",
        description: "Профессиональный макияж для особых случаев. Используем только качественную косметику.",
        price: "от 2 000 сом",
        duration: "1 час",
        category: "beauty",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"
      },
      {
        id: 6,
        title: "Наращивание ресниц",
        description: "Классическое и объемное наращивание ресниц. Гипоаллергенные материалы.",
        price: "от 4 000 сом",
        duration: "2 часа",
        category: "beauty",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop"
      }
    ];
    setServices(defaultServices);
  };

  const loadOfferings = async () => {
    try {
      const allOfferings = await apiService.getOfferings();
      setOfferings(allOfferings);
      
      // Update services with real pricing and duration from offerings
      if (allOfferings.length > 0 && services.length > 0) {
        const updatedServices = services.map(service => {
          // Find the first offering for this service
          const offering = allOfferings.find(o => o.service.id === service.id);
          if (offering) {
            return {
              ...service,
              price: `от ${offering.price} сом`,
              duration: formatDuration(offering.duration)
            };
          }
          return service;
        });
        setServices(updatedServices);
      }
    } catch (error) {
      console.error("Failed to load offerings:", error);
    }
  };

  const formatDuration = (duration: string): string => {
    // Convert "HH:MM:SS" to human readable format
    const [hours, minutes] = duration.split(':');
    if (parseInt(hours) > 0) {
      return `${hours} час${parseInt(hours) > 1 ? 'а' : ''} ${parseInt(minutes) > 0 ? `${minutes} мин` : ''}`.trim();
    }
    return `${minutes} минут`;
  };

  const categories = [
    { id: 'all', name: 'Все услуги' },
    { id: 'hair', name: 'Волосы' },
    { id: 'nails', name: 'Маникюр/Педикюр' },
    { id: 'beauty', name: 'Красота' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const handleBook = (serviceId: number) => {
    if (onBookingClick) {
      onBookingClick();
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Наши услуги
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Широкий спектр услуг красоты от профессиональных мастеров
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
          {categories.map((category) => {
            return (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  transition-all duration-300 text-xs sm:text-sm h-9 rounded-md px-3
                  ${activeCategory === category.id 
                    ? "bg-gradient-primary shadow-soft" 
                    : "border border-primary/20 hover:border-primary hover:bg-blush bg-background"
                  }
                `}
              >
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <div 
              key={service.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                price={service.price}
                duration={service.duration}
                category={categories.find(cat => cat.id === service.category)?.name || ''}
                rating={service.rating}
                image={service.image}
                onBook={() => handleBook(service.id)}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;