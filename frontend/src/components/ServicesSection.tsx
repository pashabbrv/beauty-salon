import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServicesSectionProps {
  onBookingClick?: () => void;
  availableServices?: any[];
}

const ServicesSection = ({ onBookingClick, availableServices }: ServicesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Check if we should use default services
    if (availableServices === undefined) {
      // Still loading, do nothing
      return;
    }
    
    if (availableServices === null || availableServices.length === 0) {
      // No services from API, show empty state
      setServices([]);
    } else {
      // Use the available services directly
      setServices(availableServices);
    }
  }, [availableServices]);

  const categories = [
    { id: 'all', name: 'Все услуги' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const handleBook = (serviceId: number) => {
    if (onBookingClick) {
      onBookingClick();
    }
  };

  // Show a message when there are no services
  if (services.length === 0) {
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

          {/* Empty state message */}
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              В данный момент нет доступных услуг. Пожалуйста, загляните позже.
            </p>
          </div>
        </div>
      </section>
    );
  }

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

        {/* Simple services list */}
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredServices.map((service, index) => (
              <Card 
                key={service.id} 
                className="hover:shadow-elegant transition-all duration-300 cursor-pointer border-primary/10"
                onClick={() => handleBook(service.id)}
              >
                <CardHeader className="pb-3 p-4">
                  <CardTitle className="text-base sm:text-lg text-center group-hover:text-primary transition-colors">
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking button */}
        <div className="text-center mt-8">
          <Button 
            onClick={onBookingClick}
            className="h-10 sm:h-12 text-base sm:text-lg bg-gradient-primary shadow-soft hover:shadow-elegant transition-all duration-300 px-8"
          >
            Записаться на услугу
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;