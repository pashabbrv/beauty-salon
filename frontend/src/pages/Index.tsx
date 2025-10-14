import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BookingModal from "@/components/BookingModal";
import { apiService, Service, Offering } from "@/services/api";

// Define the settings interface
interface SalonSettings {
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonDescription: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Default settings
const DEFAULT_SETTINGS: SalonSettings = {
  salonName: 'Beauty Salon',
  salonAddress: 'г. Бишкек, пр. Чуй, 168',
  salonPhone: '+996 (312) 62-45-67',
  salonDescription: 'Ваша красота - наша страсть',
  notificationsEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
};

const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SalonSettings>(DEFAULT_SETTINGS);
  
  // Refs for smooth scrolling to sections
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch only services that have offerings
    fetchAvailableServices();
    
    // Load settings from localStorage
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('salonSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  };

  const fetchAvailableServices = async () => {
    try {
      // First get all services
      const allServices = await apiService.getServices();
      
      // Then get all offerings to see which services are actually offered
      const offerings = await apiService.getOfferings();
      
      // Get unique service IDs that have offerings
      const offeredServiceIds = [...new Set(offerings.map(o => o.service.id))];
      
      // Filter services to only include those that have offerings
      const servicesWithOfferings = allServices.filter(service => 
        offeredServiceIds.includes(service.id)
      );
      
      setAvailableServices(servicesWithOfferings);
    } catch (error) {
      console.error("Failed to fetch available services:", error);
    }
  };

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
          contacts: contactsRef
        }}
      />
      
      <main>
        <HeroSection onBookingClick={openBookingModal} />
        <div ref={servicesRef}>
          <ServicesSection onBookingClick={openBookingModal} availableServices={availableServices} />
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
              {settings.salonName}
            </div>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              {settings.salonDescription}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center justify-center">📍 {settings.salonAddress}</span>
              <span className="flex items-center justify-center">📞 {settings.salonPhone}</span>
              <span className="flex items-center justify-center">🕒 Пн-Вс: 9:00-21:00</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;