import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminApiService, Service, Master, Offering } from '@/services/api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/utils/phone';

export default function AdminContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isMasterDialogOpen, setIsMasterDialogOpen] = useState(false);
  const [isOfferingDialogOpen, setIsOfferingDialogOpen] = useState(false);
  
  const [newServiceName, setNewServiceName] = useState('');
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterPhone, setNewMasterPhone] = useState('');
  
  const [selectedOffering, setSelectedOffering] = useState<{
    master_id: number;
    service_id: number;
    price: number;
    duration: string;
  }>({
    master_id: 0,
    service_id: 0,
    price: 0,
    duration: '01:00:00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, mastersData, offeringsData] = await Promise.all([
          adminApiService.getServices(),
          adminApiService.getMasters(),
          adminApiService.getOfferings()
        ]);
        
        setServices(servicesData);
        setMasters(mastersData);
        setOfferings(offeringsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateService = async () => {
    if (!newServiceName.trim()) return;
    
    try {
      const newService = await adminApiService.createService({ name: newServiceName });
      setServices([...services, newService]);
      setNewServiceName('');
      setIsServiceDialogOpen(false);
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const handleCreateMaster = async () => {
    if (!newMasterName.trim() || !newMasterPhone.trim()) return;
    
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(newMasterPhone);
    if (!formattedPhone || !isValidPhoneNumber(formattedPhone)) {
      alert('Пожалуйста, введите корректный номер телефона (+7 или +996)');
      return;
    }
    
    try {
      const newMaster = await adminApiService.createMaster({ 
        name: newMasterName, 
        phone: formattedPhone
      });
      setMasters([...masters, newMaster]);
      setNewMasterName('');
      setNewMasterPhone('');
      setIsMasterDialogOpen(false);
    } catch (error) {
      console.error('Failed to create master:', error);
    }
  };

  const handleCreateOffering = async () => {
    if (!selectedOffering.master_id || !selectedOffering.service_id || selectedOffering.price <= 0) return;
    
    try {
      const newOffering = await adminApiService.createOffering(selectedOffering);
      setOfferings([...offerings, newOffering]);
      setSelectedOffering({
        master_id: 0,
        service_id: 0,
        price: 0,
        duration: '01:00:00'
      });
      setIsOfferingDialogOpen(false);
    } catch (error) {
      console.error('Failed to create offering:', error);
    }
  };

  // Add delete service function
  const handleDeleteService = async (serviceId: number, serviceName: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить услугу "${serviceName}"?`)) {
      return;
    }
    
    try {
      await adminApiService.deleteService(serviceId);
      setServices(services.filter(service => service.id !== serviceId));
      alert('Услуга удалена успешно!');
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Ошибка при удалении услуги');
    }
  };

  // Add delete master function
  const handleDeleteMaster = async (masterId: number, masterName: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить мастера "${masterName}"?`)) {
      return;
    }
    
    try {
      await adminApiService.deleteMaster(masterId);
      setMasters(masters.filter(master => master.id !== masterId));
      alert('Мастер удален успешно!');
    } catch (error) {
      console.error('Failed to delete master:', error);
      alert('Ошибка при удалении мастера');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление контентом</h1>
        <p className="text-muted-foreground">
          Управление услугами, мастерами и предложениями
        </p>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Услуги</TabsTrigger>
          <TabsTrigger value="masters">Мастера</TabsTrigger>
          <TabsTrigger value="offerings">Предложения</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Услуги</CardTitle>
                  <CardDescription>
                    Список всех предоставляемых услуг
                  </CardDescription>
                </div>
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Добавить услугу
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить новую услугу</DialogTitle>
                      <DialogDescription>
                        Введите название новой услуги
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service-name" className="text-right">
                          Название
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id="service-name"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            placeholder="Название услуги"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleCreateService}>
                        Добавить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.id}</TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id, service.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="masters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Мастера</CardTitle>
                  <CardDescription>
                    Список всех мастеров салона
                  </CardDescription>
                </div>
                <Dialog open={isMasterDialogOpen} onOpenChange={setIsMasterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Добавить мастера
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить нового мастера</DialogTitle>
                      <DialogDescription>
                        Введите информацию о новом мастере
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="master-name" className="text-right">
                          Имя
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id="master-name"
                            value={newMasterName}
                            onChange={(e) => setNewMasterName(e.target.value)}
                            placeholder="Имя мастера"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="master-phone" className="text-right">
                          Телефон
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id="master-phone"
                            value={newMasterPhone}
                            onChange={(e) => setNewMasterPhone(e.target.value)}
                            placeholder="+7 или +996XXXXXXXXX"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsMasterDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleCreateMaster}>
                        Добавить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masters.map((master) => (
                    <TableRow key={master.id}>
                      <TableCell className="font-medium">{master.id}</TableCell>
                      <TableCell>{master.name}</TableCell>
                      <TableCell>{master.phone}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMaster(master.id, master.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offerings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Предложения</CardTitle>
                  <CardDescription>
                    Услуги мастеров с ценами и длительностью
                  </CardDescription>
                </div>
                <Dialog open={isOfferingDialogOpen} onOpenChange={setIsOfferingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Добавить предложение
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить новое предложение</DialogTitle>
                      <DialogDescription>
                        Выберите мастера, услугу и укажите цену
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="offering-master" className="text-right">
                          Мастер
                        </Label>
                        <div className="col-span-3">
                          <select
                            id="offering-master"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedOffering.master_id}
                            onChange={(e) => setSelectedOffering({
                              ...selectedOffering,
                              master_id: parseInt(e.target.value)
                            })}
                          >
                            <option value="0">Выберите мастера</option>
                            {masters.map(master => (
                              <option key={master.id} value={master.id}>
                                {master.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="offering-service" className="text-right">
                          Услуга
                        </Label>
                        <div className="col-span-3">
                          <select
                            id="offering-service"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedOffering.service_id}
                            onChange={(e) => setSelectedOffering({
                              ...selectedOffering,
                              service_id: parseInt(e.target.value)
                            })}
                          >
                            <option value="0">Выберите услугу</option>
                            {services.map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="offering-price" className="text-right">
                          Цена
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id="offering-price"
                            type="number"
                            value={selectedOffering.price || ''}
                            onChange={(e) => setSelectedOffering({
                              ...selectedOffering,
                              price: parseInt(e.target.value) || 0
                            })}
                            placeholder="Цена"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="offering-duration" className="text-right">
                          Длительность
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id="offering-duration"
                            type="text"
                            value={selectedOffering.duration}
                            onChange={(e) => setSelectedOffering({
                              ...selectedOffering,
                              duration: e.target.value
                            })}
                            placeholder="ЧЧ:ММ:СС"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsOfferingDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleCreateOffering}>
                        Добавить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Мастер</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Длительность</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerings.map((offering) => (
                    <TableRow key={offering.id}>
                      <TableCell className="font-medium">{offering.id}</TableCell>
                      <TableCell>{offering.master.name}</TableCell>
                      <TableCell>{offering.service.name}</TableCell>
                      <TableCell>{offering.price} сом</TableCell>
                      <TableCell>{offering.duration}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}