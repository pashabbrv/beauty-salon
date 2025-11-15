import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApiService, apiService, Master, Service } from "@/services/api";

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

        const masters = await apiService.getMasters();
        const offerings = await apiService.getOfferings();

        const mastersWithServicesData: MasterWithServices[] = masters.map(master => {
          const masterOfferings = offerings.filter(o => o.master.id === master.id);

          const servicesMap = new Map<number, { service: Service; price: string }>();

          masterOfferings.forEach(offering => {
            const formattedPrice = `${offering.price}`;
            if (!servicesMap.has(offering.service.id)) {
              servicesMap.set(offering.service.id, {
                service: offering.service,
                price: formattedPrice,
              });
            }
          });

          return {
            master,
            services: Array.from(servicesMap.values()),
          };
        });

        setMastersWithServices(mastersWithServicesData);
      } catch (err) {
        setError("Не удалось загрузить мастеров и услуги");
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
        <div className="container mx-auto px-4 text-center">Загрузка...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">{error}</div>
      </section>
    );
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.88";
  const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

  const getAvatarUrl = (photoUrl?: string) => {
    if (!photoUrl) return "/avatar.jpg";
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
    return `${BACKEND_BASE_URL}${photoUrl}`;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Наши мастера</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ознакомьтесь с прайс-листом наших мастеров
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {mastersWithServices.map(({ master, services }) => {
            const avatar = getAvatarUrl(master.photo_url);

            return (
              <Card
                key={master.id}
                className="hover:shadow-elegant transition-all duration-300 overflow-hidden border-primary/10 w-full max-w-sm"
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden mx-auto border-4 border-rose-gold/30">
                      <img src={avatar} alt={master.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <CardTitle className="font-semibold text-lg">{master.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {master.description || "Мастер салона"}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-muted last:border-0"
                      >
                        <span className="text-sm">{service.service.name}</span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blush text-primary border-primary/20">
                          {service.price} сом
                        </span>
                      </div>
                    ))}

                    {services.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Для этого мастера пока не добавлены услуги
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MastersServicesSection;
