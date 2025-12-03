import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminAPI, productsAPI, categoriesAPI } from "@/lib/api";
import { Plus, Edit, Trash2, Users, Package, FolderTree, Eye } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price?: number;
  sale_price?: number;
  stock_quantity: number;
  brand?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  is_active: boolean;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    sale_price: "",
    stock_quantity: "",
    brand: "",
    image_url: "",
    is_featured: false,
    category_ids: [] as number[]
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parent_id: "",
    slug: ""
  });

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadUsers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ page_size: 100 });
      setProducts(response.products || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers({ page_size: 100 });
      setUsers(response || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  // Product handlers
  const handleCreateProduct = async () => {
    try {
      await adminAPI.createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : undefined,
        stock_quantity: parseInt(productForm.stock_quantity),
      });

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      setProductDialogOpen(false);
      resetProductForm();
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      await adminAPI.updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : undefined,
        stock_quantity: parseInt(productForm.stock_quantity),
        brand: productForm.brand,
        image_url: productForm.image_url,
        is_featured: productForm.is_featured,
      });

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setProductDialogOpen(false);
      resetProductForm();
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await adminAPI.deleteProduct(productId);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      price: product.price?.toString() || "",
      sale_price: product.sale_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      brand: product.brand || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured,
      category_ids: []
    });
    setProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setProductForm({
      sku: "",
      name: "",
      description: "",
      price: "",
      sale_price: "",
      stock_quantity: "",
      brand: "",
      image_url: "",
      is_featured: false,
      category_ids: []
    });
  };

  // Category handlers
  const handleCreateCategory = async () => {
    try {
      await adminAPI.createCategory({
        name: categoryForm.name,
        parent_id: categoryForm.parent_id ? parseInt(categoryForm.parent_id) : undefined,
        slug: categoryForm.slug || undefined,
      });

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      setCategoryDialogOpen(false);
      resetCategoryForm();
      loadCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await adminAPI.deleteCategory(categoryId);

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      loadCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      parent_id: "",
      slug: ""
    });
  };

  // User handlers
  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);

      toast({
        title: "Success",
        description: "User status updated successfully",
      });

      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'disabled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your Empire Smoke store</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                </div>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetProductForm(); setEditingProduct(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                      <DialogDescription>
                        {editingProduct ? 'Update product information' : 'Create a new product in your catalog'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                            disabled={!!editingProduct}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sale_price">Sale Price</Label>
                          <Input
                            id="sale_price"
                            type="number"
                            step="0.01"
                            value={productForm.sale_price}
                            onChange={(e) => setProductForm({...productForm, sale_price: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock_quantity">Stock Quantity</Label>
                          <Input
                            id="stock_quantity"
                            type="number"
                            value={productForm.stock_quantity}
                            onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                        />
                        <Label htmlFor="is_featured">Featured Product</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setProductDialogOpen(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                        {editingProduct ? 'Update' : 'Create'} Product
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono">{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}</TableCell>
                          <TableCell>{product.stock_quantity}</TableCell>
                          <TableCell>{product.brand || '-'}</TableCell>
                          <TableCell>
                            {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Category Management</CardTitle>
                  <CardDescription>Manage product categories</CardDescription>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetCategoryForm(); setEditingCategory(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Create a new product category</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category_name">Name</Label>
                        <Input
                          id="category_name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category_slug">Slug (optional)</Label>
                        <Input
                          id="category_slug"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                          placeholder="auto-generated from name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_category">Parent Category (optional)</Label>
                        <Select value={categoryForm.parent_id} onValueChange={(value) => setCategoryForm({...categoryForm, parent_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None (Top Level)</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setCategoryDialogOpen(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Create Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="font-mono">{category.slug}</TableCell>
                        <TableCell>
                          {category.parent_id ? categories.find(c => c.id === category.parent_id)?.name : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.status}
                            onValueChange={(value) => handleUpdateUserStatus(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending_approval">Pending</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
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
    </div>
  );
};

export default Admin;
