import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Minus, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { adminApiService } from '@/services/api';
import type { Offering, Product, Transaction, CashSummary } from '@/services/api';

export default function AdminCashRegister() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todaySummary, setTodaySummary] = useState<CashSummary | null>(null);
  const [rangeSummaries, setRangeSummaries] = useState<CashSummary[]>([]);
  
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
  
  // Collection state
  const [collectionAmount, setCollectionAmount] = useState<number>(0);
  const [collectionNotes, setCollectionNotes] = useState<string>('');
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  
  // Date filter states
  const [filterStartDate, setFilterStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterEndDate, setFilterEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<string>('all');
  
  // Report range states
  const [reportRange, setReportRange] = useState<'day' | 'week' | 'month'>('day');

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Add a refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Create a useCallback for the refresh functions to avoid recreating them
  const fetchTodayTransactions = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const transactionsData = await adminApiService.getTransactions(
        today,
        today,
        undefined
      );
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching today transactions:', error);
      setError('Ошибка при загрузке сегодняшних транзакций');
    }
  }, []);

  const fetchTodaySummary = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const summaryData = await adminApiService.getCashSummary(today);
      setTodaySummary(summaryData);
    } catch (error) {
      console.error('Error fetching today summary:', error);
      setError('Ошибка при загрузке сегодняшней сводки');
    }
  }, []);

  const fetchRangeSummaries = useCallback(async () => {
    try {
      const today = new Date();
      let startDate, endDate;
      
      if (reportRange === 'day') {
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      } else if (reportRange === 'week') {
        // Get start of week (Monday)
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        startDate = format(startOfWeek, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      } else {
        // Month range
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = format(startOfMonth, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      }
      
      const summariesData = await adminApiService.getCashSummaryRange(startDate, endDate);
      setRangeSummaries(summariesData);
    } catch (error) {
      console.error('Error fetching range summaries:', error);
      setError('Ошибка при загрузке отчетов');
    }
  }, [reportRange]);

  // Update useEffect to include refreshTrigger as dependency
  useEffect(() => {
    fetchData();
    fetchTodayTransactions();
    fetchTodaySummary();
    fetchRangeSummaries();
  }, [reportRange, refreshTrigger, fetchTodayTransactions, fetchTodaySummary, fetchRangeSummaries]);

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
      setError('Ошибка при загрузке данных');
    }
  };

  const handleCreateTransaction = async () => {
    try {
      // Validate that at least one field is filled
      if (!selectedOffering && !selectedProduct && !overtimeAmount) {
        setError('Необходимо заполнить хотя бы одно поле: услуга, товар или сверхурочные');
        return;
      }
      
      // Calculate product cost if product is selected
      let productCost = 0;
      if (selectedProduct && productQuantity > 0) {
        const product = products.find(p => p.id === selectedProduct);
        if (product) {
          productCost = product.price * productQuantity;
        }
      }
      
      // Validate total amount
      if (transactionType === 'income' && totalAmount < productCost) {
        setError(`Общая сумма (${totalAmount}) не может быть меньше стоимости товара (${productCost})`);
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
      
      // Reset form
      setSelectedOffering(null);
      setSelectedProduct(null);
      setProductQuantity(0);
      setOvertimeAmount(0);
      setTotalAmount(0);
      setError(null);
      
      // Refresh data
      fetchTodayTransactions();
      fetchTodaySummary();
      fetchRangeSummaries();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      setError(error.message || 'Ошибка при создании транзакции');
    }
  };

  const handleWithdrawMoney = async () => {
    if (withdrawAmount <= 0) {
      setError('Введите корректную сумму для снятия');
      return;
    }
    
    try {
      // Use today's date for the transaction in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log('WITHDRAW: Sending request with date', today);
      await adminApiService.withdrawMoney(withdrawAmount, today);
      setWithdrawAmount(0);
      setError(null);
      
      // Force refresh all data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error withdrawing money:', error);
      setError('Ошибка при снятии денег');
    }
  };

  const handleDepositMoney = async () => {
    if (depositAmount <= 0) {
      setError('Введите корректную сумму для добавления');
      return;
    }
    
    try {
      // Use today's date for the transaction in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log('DEPOSIT: Sending request with date', today);
      await adminApiService.depositMoney(depositAmount, today);
      setDepositAmount(0);
      setError(null);
      
      // Force refresh all data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error depositing money:', error);
      setError('Ошибка при добавлении денег');
    }
  };

  const handleCollectMoney = async () => {
    if (collectionAmount <= 0) {
      setError('Введите корректную сумму для инкассации');
      return;
    }
    
    try {
      // Use today's date for the transaction in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log('COLLECT: Sending request with date', today);
      await adminApiService.collectMoney(collectionAmount, today, collectionNotes);
      setCollectionAmount(0);
      setCollectionNotes('');
      setIsCollectionModalOpen(false);
      setError(null);
      
      // Force refresh all data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error collecting money:', error);
      setError('Ошибка при инкассации');
    }
  };

  const handleFilterChange = () => {
    fetchTodayTransactions();
    fetchTodaySummary();
  };

  const handleReportRangeChange = (range: 'day' | 'week' | 'month') => {
    setReportRange(range);
  };

  const getOfferingName = (offeringId: number) => {
    const offering = offerings.find(o => o.id === offeringId);
    return offering ? `${offering.service.name} - ${offering.master.name}` : 'Не найдено';
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Не найдено';
  };

  // Calculate product cost for display
  const calculateProductCost = () => {
    if (selectedProduct && productQuantity > 0) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        return product.price * productQuantity;
      }
    }
    return 0;
  };

  // Calculate adjusted amount for display
  const calculateAdjustedAmount = () => {
    const productCost = calculateProductCost();
    if (transactionType === 'income') {
      return Math.max(0, totalAmount - productCost);
    }
    return totalAmount;
  };

  // Calculate totals for range summaries
  const calculateRangeTotals = () => {
    const totalIncome = rangeSummaries.reduce((sum, summary) => sum + summary.income, 0);
    const totalExpenses = rangeSummaries.reduce((sum, summary) => sum + summary.expenses, 0);
    const totalBalance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, totalBalance };
  };

  const { totalIncome, totalExpenses, totalBalance } = calculateRangeTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Касса</h1>
        <p className="text-muted-foreground">Управление доходами и расходами салона</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Today's Cash Summary */}
      {todaySummary && (
        <Card>
          <CardHeader>
            <CardTitle>Сегодня: {format(new Date(todaySummary.date), 'dd MMMM yyyy', { locale: ru })}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Доходы</p>
              <p className="text-2xl font-bold text-green-600">{todaySummary.income} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Расходы</p>
              <p className="text-2xl font-bold text-red-600">{todaySummary.expenses} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className={`text-2xl font-bold ${todaySummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {todaySummary.balance} сом
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
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          <div className="space-y-4">
            <h3 className="font-medium">Инкассация</h3>
            <Dialog open={isCollectionModalOpen} onOpenChange={setIsCollectionModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Инкассация
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Инкассация</DialogTitle>
                  <DialogDescription>
                    Изъятие денег из кассы без учета как расхода
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="collection-amount" className="text-right">
                      Сумма
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="collection-amount"
                        type="number"
                        value={collectionAmount || ''}
                        onChange={(e) => setCollectionAmount(Number(e.target.value))}
                        placeholder="Сумма инкассации"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="collection-notes" className="text-right">
                      Примечание
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="collection-notes"
                        value={collectionNotes}
                        onChange={(e) => setCollectionNotes(e.target.value)}
                        placeholder="Примечание к инкассации"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCollectionModalOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCollectMoney} className="bg-yellow-600 hover:bg-yellow-700">
                    Выполнить инкассацию
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <p className="text-sm text-muted-foreground">
                  Стоимость товара: {calculateProductCost()} сом
                </p>
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
              {selectedProduct && productQuantity > 0 && (
                <div className="text-sm p-2 bg-blue-50 rounded">
                  <p>Стоимость товара: {calculateProductCost()} сом</p>
                  <p className="font-medium">Итоговая сумма: {calculateAdjustedAmount()} сом</p>
                </div>
              )}
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

      {/* Today's Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Сегодняшние транзакции</CardTitle>
          <CardDescription>Транзакции за {format(new Date(), 'dd MMMM yyyy', { locale: ru })}</CardDescription>
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
                        : transaction.transaction_type === 'expense'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.transaction_type === 'income' 
                        ? 'Доход' 
                        : transaction.transaction_type === 'expense'
                        ? 'Расход'
                        : 'Инкассация'}
                    </span>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Финансовые отчеты
          </CardTitle>
          <CardDescription>Отчеты по доходам и расходам за выбранный период</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Range Selector */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={reportRange === 'day' ? 'default' : 'outline'} 
              onClick={() => handleReportRangeChange('day')}
            >
              День
            </Button>
            <Button 
              variant={reportRange === 'week' ? 'default' : 'outline'} 
              onClick={() => handleReportRangeChange('week')}
            >
              Неделя
            </Button>
            <Button 
              variant={reportRange === 'month' ? 'default' : 'outline'} 
              onClick={() => handleReportRangeChange('month')}
            >
              Месяц
            </Button>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Общий доход</p>
              <p className="text-2xl font-bold text-green-600">{totalIncome} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Общие расходы</p>
              <p className="text-2xl font-bold text-red-600">{totalExpenses} сом</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Чистая прибыль</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance} сом
              </p>
            </div>
          </div>

          {/* Detailed Report Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Доходы</TableHead>
                <TableHead>Расходы</TableHead>
                <TableHead>Баланс</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rangeSummaries.map((summary) => (
                <TableRow key={summary.date.toString()}>
                  <TableCell>{format(new Date(summary.date), 'dd.MM.yyyy')}</TableCell>
                  <TableCell className="text-green-600">{summary.income} сом</TableCell>
                  <TableCell className="text-red-600">{summary.expenses} сом</TableCell>
                  <TableCell className={summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {summary.balance} сом
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