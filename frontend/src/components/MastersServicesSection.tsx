import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApiService, Master, Offering, Service } from "@/services/api";

interface MasterWithServices {
  master: Master;
  services: {
    service: Service;
    price: string;
  }[];
}

const MastersServicesSection = () => {
  const [mastersWithServices, setMastersWithServices] = useState<MasterWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMastersServices = async () => {
      try {
        setLoading(true);
        
        // Fetch all masters
        const masters = await adminApiService.getMasters();
        
        // Fetch all offerings
        const offerings = await adminApiService.getOfferings();
        
        // Group offerings by master
        const mastersWithServicesData: MasterWithServices[] = masters.map(master => {
          const masterOfferings = offerings.filter(offering => offering.master.id === master.id);
          
          // Group offerings by service to avoid duplicates
          const servicesMap = new Map<number, { service: Service; price: string }>();
          
          masterOfferings.forEach(offering => {
            // Format price in som (just change the currency symbol, don't convert)
            const formattedPrice = `${offering.price}`;
            
            // Only add if this service isn't already added or if this price is different
            if (!servicesMap.has(offering.service.id)) {
              servicesMap.set(offering.service.id, {
                service: offering.service,
                price: formattedPrice
              });
            }
          });

          return {
            master,
            services: Array.from(servicesMap.values())
          };
        });
        
        setMastersWithServices(mastersWithServicesData);
      } catch (err) {
        setError("Failed to fetch masters and services");
        console.error("Error fetching masters and services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMastersServices();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Наши мастера
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Загрузка...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Наши мастера
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Наши мастера
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ознакомьтесь с прайс-листом наших мастеров
          </p>
        </div>

        {/* Masters Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {mastersWithServices.map((masterWithServices, index) => (
            <Card 
              key={masterWithServices.master.id}
              className="hover:shadow-elegant transition-all duration-300 overflow-hidden border-primary/10 w-full max-w-sm"
            >
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden mx-auto border-4 border-rose-gold/30">
                    <img 
                      src="/avatar.jpg" 
                      alt={masterWithServices.master.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <CardTitle className="font-semibold text-lg">
                  {masterWithServices.master.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {masterWithServices.master.specialization || "Мастер"}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {masterWithServices.services.map((service, serviceIndex) => (
                    <div 
                      key={serviceIndex}
                      className="flex justify-between items-center py-2 border-b border-muted last:border-0"
                    >
                      <span className="text-sm">{service.service.name}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blush text-primary border-primary/20">
                        {service.price} сом
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MastersServicesSection;