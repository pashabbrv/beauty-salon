import { useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import MastersSection from "@/components/MastersSection";
import BookingModal from "@/components/BookingModal";

const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Refs for smooth scrolling to sections
  const servicesRef = useRef<HTMLDivElement>(null);
  const mastersRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onNavigate={scrollToSection}
        onBookingClick={openBookingModal}
        refs={{
          services: servicesRef,
          masters: mastersRef,
          contacts: contactsRef
        }}
      />
      
      <main>
        <HeroSection onBookingClick={openBookingModal} />
        <div ref={servicesRef}>
          <ServicesSection onBookingClick={openBookingModal} />
        </div>
        <div ref={mastersRef}>
          <MastersSection onBookingClick={openBookingModal} />
        </div>
        
        {/* Booking Modal */}
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
        
        {/* Footer */}
        <footer ref={contactsRef} className="bg-foreground/5 py-8 sm:py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-primary bg-clip-text text-transparent text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Beauty Salon
            </div>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              Ваша красота - наша страсть
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center justify-center">📍 г. Бишкек, пр. Чуй, 168</span>
              <span className="flex items-center justify-center">📞 +996 (312) 62-45-67</span>
              <span className="flex items-center justify-center">🕒 Пн-Вс: 9:00-21:00</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
