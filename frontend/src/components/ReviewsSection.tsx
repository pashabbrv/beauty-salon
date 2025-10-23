import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MessageCircle, ThumbsUp, Filter } from "lucide-react";
import { calculateAverageRating } from "@/utils/ratingCalculator";

const ReviewsSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const filters = [
    { id: 'all', name: 'Все отзывы' },
    { id: '5', name: '5 звезд' },
    { id: '4', name: '4+ звезды' },
    { id: 'photo', name: 'С фото' },
  ];

  const allReviews = [
    {
      id: 1,
      name: "Айгуль Токтобаева",
      rating: 5,
      date: "2024-07-15",
      service: "Маникюр + педикюр",
      comment: "Просто восхитительно! Мастер Анна очень профессиональная, аккуратная. Маникюр держится уже 3 недели и выглядит как новый. Салон очень уютный, чисто. Обязательно приду еще!",
      avatar: "/placeholder.svg",
      photos: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=200&fit=crop"],
      helpful: 12
    },
    {
      id: 2,
      name: "Нургуль Сыдыкова",
      rating: 5,
      date: "2024-07-12",
      service: "Стрижка + окрашивание",
      comment: "Мария - мастер от Бога! Сделала именно то, что я хотела. Волосы стали выглядеть намного лучше. Цена соответствует качеству. Рекомендую всем подругам!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 8
    },
    {
      id: 3,
      name: "Асель Жолдошева",
      rating: 4,
      date: "2024-07-10",
      service: "Макияж",
      comment: "Хороший салон, вежливый персонал. Макияж держался весь день, на фотографиях выглядел отлично. Единственное - немного долго ждала своей очереди, но результат того стоил.",
      avatar: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=80&h=80&fit=crop&crop=face",
      photos: ["https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=200&fit=crop"],
      helpful: 5
    },
    {
      id: 4,
      name: "Бермет Абдыразакова",
      rating: 5,
      date: "2024-07-08",
      service: "Наращивание ресниц",
      comment: "Елена - просто волшебница! Ресницы получились очень натуральными, но при этом выразительными. Носила 4 недели, практически не выпадали. Уже записалась на коррекцию.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
      photos: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=200&fit=crop"],
      helpful: 15
    },
    {
      id: 5,
      name: "Жылдыз Касымова",
      rating: 5,
      date: "2024-07-05",
      service: "Комплекс: стрижка + маникюр",
      comment: "Решила попробовать сразу несколько услуг - не пожалела! Очень удобно сделать все в одном месте. Мастера работают синхронно, качество на высоте. Буду теперь постоянной клиенткой!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 9
    },
    {
      id: 6,
      name: "Гульмира Омурбекова",
      rating: 4,
      date: "2024-07-03",
      service: "Педикюр SPA",
      comment: "Очень расслабляющая процедура! Ноги стали как у младенца. Массаж просто божественный. Атмосфера в салоне способствует полному релаксу. Цены приемлемые.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 7
    },
    // Дополнительные отзывы (показываются после нажатия "Показать еще")
    {
      id: 7,
      name: "Гульнара Осмонова",
      rating: 5,
      date: "2024-07-01",
      service: "Уход за лицом",
      comment: "Великолепная процедура! Кожа стала мягкой и сияющей. Мастер очень внимательная, объяснила каждый этап ухода. Салон чистый, атмосфера расслабляющая.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 11
    },
    {
      id: 8,
      name: "Медина Турдубекова",
      rating: 4,
      date: "2024-06-28",
      service: "Окрашивание бровей",
      comment: "Хороший результат, брови выглядят естественно. Цвет подобрали идеально под мой оттенок волос. Единственный минус - процедура заняла немного больше времени чем планировалось.",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 6
    },
    {
      id: 9,
      name: "Назгуль Акматова",
      rating: 5,
      date: "2024-06-25",
      service: "Массаж головы + маска",
      comment: "Невероятно расслабляющая процедура! После стресса на работе это было именно то, что нужно. Волосы стали более блестящими, а голова просто летает от легкости.",
      avatar: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=80&h=80&fit=crop&crop=face",
      photos: [],
      helpful: 13
    }
  ];

  const reviews = showAllReviews ? allReviews : allReviews.slice(0, 6);

  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    // Фильтрация
    if (activeFilter === '5') {
      filtered = filtered.filter(review => review.rating === 5);
    } else if (activeFilter === '4') {
      filtered = filtered.filter(review => review.rating >= 4);
    } else if (activeFilter === 'photo') {
      filtered = filtered.filter(review => review.photos.length > 0);
    }
    
    // Сортировка
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpful - a.helpful);
    }
    
    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Отзывы клиентов
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мнения наших довольных клиентов о качестве услуг и сервисе
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{calculateAverageRating(allReviews)}</div>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">Средний рейтинг</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{allReviews.length}</div>
              <div className="text-sm text-muted-foreground">Всего отзывов</div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  transition-all duration-300
                  ${activeFilter === filter.id 
                    ? "bg-gradient-primary shadow-soft" 
                    : "border-primary/20 hover:border-primary hover:bg-blush"
                  }
                `}
              >
                {filter.name}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-primary/20 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Сначала новые</option>
              <option value="rating">По рейтингу</option>
              <option value="helpful">По полезности</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {getFilteredReviews().map((review, index) => (
            <Card 
              key={review.id}
              className="hover:shadow-elegant transition-all duration-300 bg-card border-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-rose-gold/30"
                    />
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${
                                star <= review.rating 
                                  ? "fill-accent text-accent" 
                                  : "text-muted-foreground"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blush text-primary">
                    {review.service}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {review.comment}
                </p>
                
                {/* Photos */}
                {review.photos.length > 0 && (
                  <div className="flex space-x-2">
                    {review.photos.map((photo, photoIndex) => (
                      <img 
                        key={photoIndex}
                        src={photo} 
                        alt="Фото результата"
                        className="w-20 h-20 rounded-lg object-cover border border-primary/10"
                      />
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Полезно ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Ответить
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {!showAllReviews && (
          <div className="text-center mt-10">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowAllReviews(true)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Показать еще отзывы ({allReviews.length - 6})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;