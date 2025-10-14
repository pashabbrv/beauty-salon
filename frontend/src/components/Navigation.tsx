import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onNavigate?: (sectionRef: React.RefObject<HTMLDivElement>) => void;
  onBookingClick?: () => void;
  refs?: {
    services: React.RefObject<HTMLDivElement>;
    masters?: React.RefObject<HTMLDivElement>;
    contacts: React.RefObject<HTMLDivElement>;
  };
}

const Navigation = ({ onNavigate, onBookingClick, refs }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (refKey: keyof typeof refs) => {
    if (refs && onNavigate && refs[refKey]) {
      onNavigate(refs[refKey] as React.RefObject<HTMLDivElement>);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-full">
              <div className="w-6 h-6 text-white">✨</div>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Beauty Salon
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Button 
              onClick={() => handleNavClick('services')}
              className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
            >
              Услуги
            </Button>
            {refs?.masters && (
              <Button 
                onClick={() => handleNavClick('masters')}
                className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
              >
                Мастера
              </Button>
            )}
            <Button 
              onClick={() => handleNavClick('contacts')}
              className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
            >
              Контакты
            </Button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Button 
              onClick={onBookingClick}
              className="bg-gradient-primary text-white border-0 hover:opacity-90"
            >
              📅 Записаться
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            className="md:hidden bg-transparent hover:bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-5 h-5">☰</div>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-primary p-2 rounded-full">
                    <div className="w-6 h-6 text-white">✨</div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Beauty Salon
                  </span>
                </div>
                <Button
                  className="bg-transparent hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-5 h-5">☰</div>
                </Button>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex-1 p-4 space-y-4">
                <Button 
                  onClick={() => handleNavClick('services')}
                  className="w-full justify-start text-lg h-12 text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
                >
                  Услуги
                </Button>
                {refs?.masters && (
                  <Button 
                    onClick={() => handleNavClick('masters')}
                    className="w-full justify-start text-lg h-12 text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
                  >
                    Мастера
                  </Button>
                )}
                <Button 
                  onClick={() => handleNavClick('contacts')}
                  className="w-full justify-start text-lg h-12 text-foreground/80 hover:text-foreground hover:bg-foreground/5 bg-transparent"
                >
                  Контакты
                </Button>
              </div>

              {/* Mobile CTA Button */}
              <div className="p-4 border-t border-border">
                <Button 
                  className="w-full h-12 text-lg bg-gradient-primary text-white border-0 hover:opacity-90"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onBookingClick?.();
                  }}
                >
                  📅 Записаться
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;