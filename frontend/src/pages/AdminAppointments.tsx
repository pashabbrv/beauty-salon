import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminApiService, Appointment } from '@/services/api';
import { Search, CheckCircle, XCircle, Calendar, Plus } from 'lucide-react';
import AdminBookingModal from '@/components/AdminBookingModal';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await adminApiService.getAppointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = appointments;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(appointment => 
        appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.phone.includes(searchTerm) ||
        appointment.offering.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.offering.master.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isConfirmed = statusFilter === 'confirmed';
      result = result.filter(appointment => appointment.confirmed === isConfirmed);
    }
    
    setFilteredAppointments(result);
  }, [searchTerm, statusFilter, appointments]);

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      await adminApiService.confirmAppointment(appointmentId);
      // Refresh the appointments list
      const updatedAppointments = await adminApiService.getAppointments();
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await adminApiService.deleteAppointment(appointmentId);
      // Remove the appointment from the list
      setAppointments(appointments.filter(a => a.id !== appointmentId));
      setFilteredAppointments(filteredAppointments.filter(a => a.id !== appointmentId));
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleBookingCreated = async () => {
    // Refresh the appointments list
    try {
      const updatedAppointments = await adminApiService.getAppointments();
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);
    } catch (error) {
      console.error('Failed to refresh appointments:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление записями</h1>
        <p className="text-muted-foreground">
          Просмотр и управление записями клиентов
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Записи</CardTitle>
              <CardDescription>
                Список всех записей клиентов
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setIsBookingModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать запись
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени, телефону, услуге или мастеру..."
                  className="pl-8 w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Все статусы</option>
                <option value="confirmed">Подтвержденные</option>
                <option value="pending">Ожидающие</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Мастер</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.name}</TableCell>
                  <TableCell>{appointment.phone}</TableCell>
                  <TableCell>{appointment.offering.service.name}</TableCell>
                  <TableCell>{appointment.offering.master.name}</TableCell>
                  <TableCell>
                    {new Date(appointment.slot.start).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={appointment.confirmed ? 'default' : 'secondary'}>
                      {appointment.confirmed ? 'Подтверждена' : 'Ожидает'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!appointment.confirmed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Записи не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или фильтра
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AdminBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
}