import { useEffect, useState } from "react";
import MasterCard from "./MasterCard";
import { apiService, Master } from "@/services/api";

interface MastersSectionProps {
  onBookingClick?: () => void;
}

const MastersSection = ({ onBookingClick }: MastersSectionProps) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const data = await apiService.getMasters();
        setMasters(data);
      } catch (error) {
        console.error("Failed to fetch masters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.88";
  const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

  const getAvatarUrl = (photoUrl?: string) => {
    if (!photoUrl) return "/placeholder.svg";
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
    return `${BACKEND_BASE_URL}${photoUrl}`;
  };

  const handleBookMaster = (masterName: string) => {
    if (onBookingClick) onBookingClick();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blush/30 to-champagne/20">
        <div className="container mx-auto px-4 text-center">Загрузка мастеров...</div>
      </section>
    );
  }

  if (!masters.length) {
    return (
      <section className="py-16 bg-gradient-to-br from-blush/30 to-champagne/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Наши мастера</h2>
          <p className="text-muted-foreground">
            Здесь скоро появится информация о мастерах салона.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blush/30 to-champagne/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Наши мастера</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Профессиональные мастера с индивидуальным подходом к каждому гостю
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masters.map((master, index) => {
            const avatar = getAvatarUrl(master.photo_url);

            const specialization = master.description || "Мастер салона";
            const experience = "Опыт более 1 года";
            const specialties = ["Индивидуальный подход"];
            const rating = master.rating ?? 5.0;
            const reviewCount = 0;

            return (
              <div
                key={master.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <MasterCard
                  name={master.name}
                  specialization={specialization}
                  experience={experience}
                  rating={rating}
                  reviewCount={reviewCount}
                  avatar={avatar}
                  specialties={specialties}
                  onBook={() => handleBookMaster(master.name)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MastersSection;
