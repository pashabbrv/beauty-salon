import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";

interface MasterCardProps {
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  specialties: string[];
  onBook?: () => void;
}

const MasterCard = ({
  name,
  specialization,
  experience,
  rating,
  reviewCount,
  avatar,
  specialties,
  onBook
}: MasterCardProps) => {
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-champagne/30 border-primary/10">
      <CardHeader className="text-center pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="relative mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto border-4 border-rose-gold/30 group-hover:border-rose-gold transition-colors duration-300">
            <img 
              src={avatar} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="mt-2 sm:mt-3">
          <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{specialization}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Опыт:</span>
          <span className="font-medium">{experience}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {specialties.map((specialty, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-blush text-primary border-primary/20"
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 sm:p-6">
        <Button 
          onClick={onBook}
          variant="outline"
          className="w-full h-9 sm:h-10 text-sm sm:text-base border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Записаться к мастеру
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MasterCard;