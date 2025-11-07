import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApiService, Product } from '@/services/api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // Edit states
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    quantity: 0,
    unit: 'pieces' // Default to pieces
  });
  
  // Edit product form state
  const [editProductData, setEditProductData] = useState({
    name: '',
    price: 0,
    quantity: 0,
    unit: 'pieces'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await adminApiService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim() || newProduct.price <= 0 || newProduct.quantity < 0) return;
    
    try {
      const newProductData = await adminApiService.createProduct(newProduct);
      setProducts([...products, newProductData]);
      setNewProduct({
        name: '',
        price: 0,
        quantity: 0,
        unit: 'pieces'
      });
      setIsProductDialogOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Ошибка при создании товара');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      unit: product.unit
    });
    setIsEditProductDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editProductData.name.trim()) return;
    
    try {
      const updatedProduct = await adminApiService.updateProduct(editingProduct.id, editProductData);
      setProducts(products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ));
      setIsEditProductDialogOpen(false);
      setEditingProduct(null);
      alert('Товар успешно обновлен!');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Ошибка при обновлении товара');
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
      return;
    }
    
    try {
      await adminApiService.deleteProduct(productId);
      setProducts(products.filter(product => product.id !== productId));
      alert('Товар удален успешно!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Ошибка при удалении товара');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление товарами</h1>
        <p className="text-muted-foreground">
          Добавление, редактирование и удаление товаров
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Товары</CardTitle>
              <CardDescription>
                Список всех товаров салона
              </CardDescription>
            </div>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить товар
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новый товар</DialogTitle>
                  <DialogDescription>
                    Введите информацию о новом товаре
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product-name" className="text-right">
                      Название
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Название товара"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product-price" className="text-right">
                      Цена (сом)
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="product-price"
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                        placeholder="Цена"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product-quantity" className="text-right">
                      Количество
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="product-quantity"
                        type="number"
                        value={newProduct.quantity || ''}
                        onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
                        placeholder="Количество"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product-unit" className="text-right">
                      Единица измерения
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={newProduct.unit} 
                        onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите единицу измерения" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieces">Штуки</SelectItem>
                          <SelectItem value="milliliters">Миллилитры</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateProduct}>
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
                <TableHead>Цена (сом)</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Единица измерения</TableHead>
                <TableHead>Дата добавления</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.unit === 'pieces' ? 'Штуки' : 'Миллилитры'}</TableCell>
                  <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id, product.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
            <DialogDescription>
              Измените информацию о товаре
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-name" className="text-right">
                Название
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-product-name"
                  value={editProductData.name}
                  onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                  placeholder="Название товара"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-price" className="text-right">
                Цена (сом)
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-product-price"
                  type="number"
                  value={editProductData.price || ''}
                  onChange={(e) => setEditProductData({...editProductData, price: parseInt(e.target.value) || 0})}
                  placeholder="Цена"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-quantity" className="text-right">
                Количество
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-product-quantity"
                  type="number"
                  value={editProductData.quantity || ''}
                  onChange={(e) => setEditProductData({...editProductData, quantity: parseInt(e.target.value) || 0})}
                  placeholder="Количество"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-unit" className="text-right">
                Единица измерения
              </Label>
              <div className="col-span-3">
                <Select 
                  value={editProductData.unit} 
                  onValueChange={(value) => setEditProductData({...editProductData, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите единицу измерения" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Штуки</SelectItem>
                    <SelectItem value="milliliters">Миллилитры</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateProduct}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}