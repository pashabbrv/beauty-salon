import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service } from "@/services/api";

interface ServicesSectionProps {
  onBookingClick?: () => void;
  availableServices?: Service[];
}

// --- БАЗОВЫЙ URL ДЛЯ КАРТИНОК ---
// VITE_API_URL может быть как "http://host:8000/api", так и "http://host:8000"
const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "";

// Убираем хвост / и возможный /api
const IMAGE_BASE_URL = RAW_API_URL
  .replace(/\/$/, "")        // убираем последний /
  .replace(/\/api$/, "");    // убираем хвост /api, если есть

function getServiceImageUrl(service: Service): string | null {
  if (!service.photo_url) return null;

  // Если уже полный URL — просто отдаём
  if (
    service.photo_url.startsWith("http://") ||
    service.photo_url.startsWith("https://")
  ) {
    return service.photo_url;
  }

  // Относительный путь из бэка (типа "/media/services/xxx.jpg")
  if (IMAGE_BASE_URL) {
    return `${IMAGE_BASE_URL}${service.photo_url}`;
  }

  // На крайний случай просто вернём как есть
  return service.photo_url;
}

const ServicesSection = ({ onBookingClick, availableServices }: ServicesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (availableServices === undefined) {
      return;
    }

    if (availableServices === null || availableServices.length === 0) {
      setServices([]);
    } else {
      setServices(availableServices);
    }
  }, [availableServices]);

  const categories = [{ id: "all", name: "Все услуги" }];

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((service: any) => service.category === activeCategory);

  const handleBook = (serviceId: number) => {
    if (onBookingClick) onBookingClick();
  };

  if (services.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
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
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Наши услуги
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Широкий спектр услуг красоты от профессиональных мастеров
          </p>
        </div>

        <div className="w-[90%] mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {filteredServices.map((service) => {
              const imgUrl = getServiceImageUrl(service);

              return (
                <div key={service.id} className="w-[30%] min-w-[220px]">
                  <Card
                    className="hover:shadow-elegant transition-all duration-300 cursor-pointer border-primary/10 h-full"
                    onClick={() => handleBook(service.id)}
                  >
                    <CardHeader className="pb-3 p-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center mx-auto overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          ) : (
                            <svg
                              className="w-12 h-12 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
