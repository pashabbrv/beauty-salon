import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Scissors, 
  User, 
  Wallet, 
  TrendingUp, 
  Package,
  BarChart3,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { adminApiService, AdminStats } from '@/services/api';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApiService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Дашборд статистики</h1>
        <p className="text-muted-foreground">
          Комплексная статистика по всем системам салона красоты
        </p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего записей</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Все записи в системе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Подтверждено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmedAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Подтвержденные записи
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидает</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Неподтвержденные записи
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Зарегистрированные клиенты
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Statistics */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Финансовая статистика
              </div>
            </CardTitle>
            <CardDescription>
              Доходы, расходы и баланс за текущий месяц
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <span className="text-2xl font-bold text-green-600">{stats?.totalIncome || 0} сом</span>
              <span className="text-sm text-green-700">Доходы</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
              <span className="text-2xl font-bold text-red-600">{stats?.totalExpenses || 0} сом</span>
              <span className="text-sm text-red-700">Расходы</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl font-bold text-blue-600">{stats?.currentBalance || 0} сом</span>
              <span className="text-sm text-blue-700">Баланс</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Общая статистика
              </div>
            </CardTitle>
            <CardDescription>
              Ключевые показатели системы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Услуги</span>
              <Badge variant="secondary">{stats?.totalServices || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Мастера</span>
              <Badge variant="secondary">{stats?.totalMasters || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Товары</span>
              <Badge variant="secondary">{stats?.totalProducts || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Низкий запас</span>
              <Badge variant="destructive">{stats?.lowStockProducts || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Statistics */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Статистика клиентов
              </div>
            </CardTitle>
            <CardDescription>
              Распределение клиентов по статусам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Новые клиенты</span>
              <Badge>{stats?.newCustomers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Постоянные клиенты</span>
              <Badge>{stats?.regularCustomers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Капризные клиенты</span>
              <Badge>{stats?.capriciousCustomers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Заблокированные</span>
              <Badge variant="destructive">{stats?.blockedCustomers || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Записи на сегодня
              </div>
            </CardTitle>
            <CardDescription>
              Текущие и предстоящие записи
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Сегодня</span>
              <Badge>{stats?.todayAppointments || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Предстоящие</span>
              <Badge>{stats?.upcomingAppointments || 0}</Badge>
            </div>
            <div className="pt-4">
              <h4 className="font-medium mb-2">Популярные услуги</h4>
              <div className="space-y-2">
                {stats?.popularServices.slice(0, 3).map((service, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{service.service}</span>
                    <span className="font-medium">{service.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Нагрузка по мастерам
              </div>
            </CardTitle>
            <CardDescription>
              Загруженность мастеров
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.masterWorkload.slice(0, 5).map((master, index) => (
              <div key={index} className="flex justify-between">
                <span>{master.master}</span>
                <span className="font-medium">{master.appointments} записей</span>
              </div>
            ))}
            {(!stats?.masterWorkload || stats.masterWorkload.length === 0) && (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attention Section */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Внимание
              </div>
            </CardTitle>
            <CardDescription>
              Важные уведомления
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.lowStockProducts && stats.lowStockProducts > 0 ? (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Низкий запас товаров</span>
                </div>
                <p className="text-sm text-yellow-700">
                  {stats.lowStockProducts} товаров с низким запасом
                </p>
              </div>
            ) : (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Запасы в норме</span>
                </div>
                <p className="text-sm text-green-700">
                  Все товары в достаточном количестве
                </p>
              </div>
            )}
            
            {stats?.pendingAppointments && stats.pendingAppointments > 0 ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Ожидают подтверждения</span>
                </div>
                <p className="text-sm text-blue-700">
                  {stats.pendingAppointments} записей требуют подтверждения
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}