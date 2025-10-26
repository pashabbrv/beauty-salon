import MasterCard from "./MasterCard";

interface MastersSectionProps {
  onBookingClick?: () => void;
}

const MastersSection = ({ onBookingClick }: MastersSectionProps) => {
  const masters = [
    {
      name: "Анна Петрова",
      specialization: "Топ-стилист",
      experience: "8 лет",
      rating: 4.9,
      reviewCount: 234,
      avatar: "/placeholder.svg",
      specialties: ["Стрижки", "Окрашивание", "Укладки"]
    },
    {
      name: "Мария Иванова",
      specialization: "Мастер маникюра",
      experience: "5 лет",
      rating: 4.8,
      reviewCount: 189,
      avatar: "/placeholder.svg",
      specialties: ["Маникюр", "Педикюр", "Nail-арт"]
    },
    {
      name: "Елена Смирнова",
      specialization: "Визажист",
      experience: "6 лет",
      rating: 4.9,
      reviewCount: 156,
      avatar: "/placeholder.svg",
      specialties: ["Макияж", "Брови", "Ресницы"]
    }
  ];

  const handleBookMaster = (masterName: string) => {
    if (onBookingClick) {
      onBookingClick();
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blush/30 to-champagne/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Наши мастера
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Профессиональные стилисты с многолетним опытом и сотнями довольных клиентов
          </p>
        </div>

        {/* Masters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masters.map((master, index) => (
            <div 
              key={master.name}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <MasterCard
                name={master.name}
                specialization={master.specialization}
                experience={master.experience}
                rating={master.rating}
                reviewCount={master.reviewCount}
                avatar={master.avatar}
                specialties={master.specialties}
                onBook={() => handleBookMaster(master.name)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MastersSection;
