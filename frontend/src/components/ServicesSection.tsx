import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

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
        <div className="w-[90%] mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {filteredServices.map((service, index) => (
              <div key={service.id} className="w-[30%] min-w-[220px]">
                <Card 
                  className="hover:shadow-elegant transition-all duration-300 cursor-pointer border-primary/10 h-full"
                  onClick={() => handleBook(service.id)}
                >
                  <CardHeader className="pb-3 p-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-12 h-12 text-gray-500" />
                      </div>
                      <CardTitle className="text-base sm:text-lg text-center group-hover:text-primary transition-colors">
                        {service.name}
                      </CardTitle>
                      <Button 
                        className="w-full bg-gradient-primary shadow-soft hover:shadow-elegant transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(service.id);
                        }}
                      >
                        Записаться
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
