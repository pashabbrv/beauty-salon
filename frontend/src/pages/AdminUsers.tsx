import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApiService, Customer } from '@/services/api';
import { Search, Edit, User } from 'lucide-react';

export default function AdminUsers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const [customersData, statuses] = await Promise.all([
          adminApiService.getCustomers(),
          adminApiService.getCustomerStatuses()
        ]);
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        setAvailableStatuses(statuses);
        // Set default status for new customers
        if (statuses.length > 0) {
          setNewStatus(statuses[0]);
        }
      } catch (error) {
        console.error('Failed to fetch customers or statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = customers;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    setFilteredCustomers(result);
  }, [searchTerm, statusFilter, customers]);

  const handleStatusChange = async (phone: string, status: string) => {
    try {
      const updatedCustomer = await adminApiService.updateCustomerStatus(phone, status);
      setCustomers(customers.map(c => c.phone === phone ? updatedCustomer : c));
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  // New handlers for specific status types
  const handleSetStatusNew = async (phone: string) => {
    try {
      const updatedCustomer = await adminApiService.setCustomerStatusNew(phone);
      setCustomers(customers.map(c => c.phone === phone ? updatedCustomer : c));
    } catch (error) {
      console.error('Failed to set customer status to new:', error);
    }
  };

  const handleSetStatusRegular = async (phone: string) => {
    try {
      const updatedCustomer = await adminApiService.setCustomerStatusRegular(phone);
      setCustomers(customers.map(c => c.phone === phone ? updatedCustomer : c));
    } catch (error) {
      console.error('Failed to set customer status to regular:', error);
    }
  };

  const handleSetStatusCapricious = async (phone: string) => {
    try {
      const updatedCustomer = await adminApiService.setCustomerStatusCapricious(phone);
      setCustomers(customers.map(c => c.phone === phone ? updatedCustomer : c));
    } catch (error) {
      console.error('Failed to set customer status to capricious:', error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewStatus(customer.status);
    setIsDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (editingCustomer) {
      await handleStatusChange(editingCustomer.phone, newStatus);
      setIsDialogOpen(false);
      setEditingCustomer(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'regular':
        return 'secondary';
      case 'capricious':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'new':
        return 'Новый';
      case 'regular':
        return 'Постоянный';
      case 'capricious':
        return 'Капризный';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление пользователями</h1>
        <p className="text-muted-foreground">
          Управление клиентами и их статусами
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Клиенты</CardTitle>
              <CardDescription>
                Список всех клиентов салона
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или телефону..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.phone}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(customer.status) as any}>
                      {getStatusDisplayName(customer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetStatusNew(customer.phone)}
                        disabled={customer.status === 'new'}
                      >
                        Новый
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetStatusRegular(customer.phone)}
                        disabled={customer.status === 'regular'}
                      >
                        Постоянный
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetStatusCapricious(customer.phone)}
                        disabled={customer.status === 'capricious'}
                      >
                        Капризный
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Клиенты не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или фильтра
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус клиента</DialogTitle>
            <DialogDescription>
              Изменение статуса клиента {editingCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Имя
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={editingCustomer?.name || ''}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Телефон
              </Label>
              <div className="col-span-3">
                <Input
                  id="phone"
                  value={editingCustomer?.phone || ''}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Статус
              </Label>
              <div className="col-span-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {getStatusDisplayName(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStatus}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}