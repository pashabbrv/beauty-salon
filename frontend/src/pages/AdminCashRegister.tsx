import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { adminApiService } from '@/services/api';
import type { Offering, Product, Transaction, CashSummary } from '@/services/api';

export default function AdminCashRegister() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  
  // Form states
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(0);
  const [overtimeAmount, setOvertimeAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [transactionDate, setTransactionDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Withdraw/deposit states
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  
  // Date filter states
  const [filterStartDate, setFilterStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterEndDate, setFilterEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchData();
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchData = async () => {
    try {
      const [offeringsData, productsData] = await Promise.all([
        adminApiService.getOfferings(),
        adminApiService.getProducts()
      ]);
      setOfferings(offeringsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionsData = await adminApiService.getTransactions(
        filterStartDate,
        filterEndDate,
        filterType !== 'all' ? filterType : undefined
      );
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await adminApiService.getCashSummary(filterStartDate);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      // Validate that at least one field is filled
      if (!selectedOffering && !selectedProduct && !overtimeAmount) {
        alert('Необходимо заполнить хотя бы одно поле: услуга, товар или сверхурочные');
        return;
      }
      
      const transactionData = {
        offering_id: selectedOffering,
        product_id: selectedProduct,
        product_quantity_used: selectedProduct ? productQuantity : null,
        overtime_amount: overtimeAmount || null,
        total_amount: totalAmount,
        transaction_type: transactionType,
        transaction_date: transactionDate
      };
      
      await adminApiService.createTransaction(transactionData);
      alert('Транзакция успешно создана');
      
      // Reset form
      setSelectedOffering(null);
      setSelectedProduct(null);
      setProductQuantity(0);
      setOvertimeAmount(0);
      setTotalAmount(0);
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Ошибка при создании транзакции');
    }
  };

  const handleWithdrawMoney = async () => {
    if (withdrawAmount <= 0) {
      alert('Введите корректную сумму для снятия');
      return;
    }
    
    try {
      await adminApiService.withdrawMoney(withdrawAmount);
      alert('Деньги успешно сняты из кассы');
      setWithdrawAmount(0);
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error withdrawing money:', error);
      alert('Ошибка при снятии денег');
    }
  };

  const handleDepositMoney = async () => {
    if (depositAmount <= 0) {
      alert('Введите корректную сумму для добавления');
      return;
    }
    
    try {
      await adminApiService.depositMoney(depositAmount);
      alert('Деньги успешно добавлены в кассу');
      setDepositAmount(0);
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error depositing money:', error);
      alert('Ошибка при добавлении денег');
    }
  };

  const handleFilterChange = () => {
    fetchTransactions();
    fetchSummary();
  };

  const getOfferingName = (offeringId: number) => {
    const offering = offerings.find(o => o.id === offeringId);
    return offering ? `${offering.service.name} - ${offering.master.name}` : 'Не найдено';
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Не найдено';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Касса</h1>
        <p className="text-muted-foreground">Управление доходами и расходами салона</p>
      </div>

      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Сводка за {format(new Date(summary.date), 'dd MMMM yyyy', { locale: ru })}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Доходы</p>
              <p className="text-2xl font-bold text-green-600">{summary.income} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Расходы</p>
              <p className="text-2xl font-bold text-red-600">{summary.expenses} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.balance} сом
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Money Section */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить/Снять деньги</CardTitle>
          <CardDescription>Быстрые операции с кассой</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Добавить деньги в кассу</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Сумма"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
              <Button onClick={handleDepositMoney} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Снять деньги из кассы</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Сумма"
                value={withdrawAmount || ''}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              />
              <Button onClick={handleWithdrawMoney} className="bg-red-600 hover:bg-red-700">
                <Minus className="h-4 w-4 mr-2" />
                Снять
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Section */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить транзакцию</CardTitle>
          <CardDescription>Формирование транзакции по услуге, товару или сверхурочным</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label>Услуга + Мастер</Label>
              <Select 
                value={selectedOffering?.toString() || ''} 
                onValueChange={(value) => setSelectedOffering(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {offerings.map((offering) => (
                    <SelectItem key={offering.id} value={offering.id.toString()}>
                      {offering.service.name} - {offering.master.name} ({offering.price} сом)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Товар</Label>
              <Select 
                value={selectedProduct?.toString() || ''} 
                onValueChange={(value) => {
                  setSelectedProduct(Number(value));
                  // Reset quantity when product changes
                  setProductQuantity(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите товар" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.price} сом/{product.unit === 'milliliters' ? 'мл' : 'шт'}) - 
                      Остаток: {product.quantity} {product.unit === 'milliliters' ? 'мл' : 'шт'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Quantity */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label>Количество товара (мл/шт)</Label>
                <Input
                  type="number"
                  placeholder="Количество"
                  value={productQuantity || ''}
                  onChange={(e) => setProductQuantity(Number(e.target.value))}
                />
              </div>
            )}

            {/* Overtime Amount */}
            <div className="space-y-2">
              <Label>Сверхурочные (сом)</Label>
              <Input
                type="number"
                placeholder="Сумма сверхурочных"
                value={overtimeAmount || ''}
                onChange={(e) => setOvertimeAmount(Number(e.target.value))}
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label>Общая сумма (сом)</Label>
              <Input
                type="number"
                placeholder="Общая сумма"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Тип транзакции</Label>
              <Select 
                value={transactionType} 
                onValueChange={(value) => setTransactionType(value as 'income' | 'expense')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Доход</SelectItem>
                  <SelectItem value="expense">Расход</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <Label>Дата транзакции</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Button onClick={handleCreateTransaction} className="w-full">
            Создать транзакцию
          </Button>
        </CardContent>
      </Card>

      {/* Transactions Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтр транзакций</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Дата начала</Label>
            <div className="relative">
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Дата окончания</Label>
            <div className="relative">
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Тип транзакции</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="income">Доходы</SelectItem>
                <SelectItem value="expense">Расходы</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleFilterChange} className="w-full">
              Применить фильтр
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Сверхурочные</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Тип</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.transaction_date), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    {transaction.offering_id ? getOfferingName(transaction.offering_id) : '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.product_id ? `${getProductName(transaction.product_id)} (${transaction.product_quantity_used})` : '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.overtime_amount ? `${transaction.overtime_amount} сом` : '-'}
                  </TableCell>
                  <TableCell className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.total_amount} сом
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type === 'income' ? 'Доход' : 'Расход'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}