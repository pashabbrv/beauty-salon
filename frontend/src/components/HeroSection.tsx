import { Button } from "@/components/ui/button";
import { Calendar, Star, MapPin, Phone } from "lucide-react";
import heroImage from "@/assets/salon-hero.jpg";

interface HeroSectionProps {
  onBookingClick?: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Beauty Salon Interior"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in text-center lg:text-left">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Салон красоты
                </span>
                <br />
                <span className="text-foreground">премиум класса</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Откройте для себя мир красоты и роскоши в нашем салоне. 
                Профессиональные мастера, качественные услуги и атмосфера релакса.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">г. Бишкек, пр. Чуй, 168</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">+996 (312) 62-45-67</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={onBookingClick}
                className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300 h-12 text-base sm:text-lg px-6 sm:px-8"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Записаться сейчас
              </Button>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="space-y-3 sm:space-y-4 animate-slide-up mt-8 lg:mt-0">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-primary/10">
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Премиум услуги</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Маникюр, педикюр, стрижки, окрашивание от ведущих мастеров</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-primary/10">
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Удобная запись</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Онлайн бронирование в удобное время с подтверждением</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-primary/10">
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Роскошная атмосфера</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Современный интерьер и комфортные условия для отдыха</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;