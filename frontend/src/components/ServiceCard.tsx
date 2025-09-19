import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  rating?: number;
  image?: string;
  onBook?: () => void;
}

const ServiceCard = ({
  title,
  description,
  price,
  duration,
  category,
  rating = 4.8,
  image,
  onBook
}: ServiceCardProps) => {
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-blush/20 border-primary/10">
      {image && (
        <div className="relative h-36 sm:h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-accent text-accent-foreground text-xs">
            {category}
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="py-0 px-3 sm:px-6">
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{duration}</span>
          </div>
          <div className="text-sm sm:text-lg font-bold text-primary">
            {price}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 sm:pt-4 p-3 sm:p-6">
        <Button 
          onClick={onBook}
          className="w-full h-9 sm:h-10 text-sm sm:text-base bg-gradient-primary shadow-soft hover:shadow-elegant transition-all duration-300"
        >
          Записаться
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;