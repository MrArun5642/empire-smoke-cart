import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { productsAPI } from "@/lib/api";
import { toast } from "sonner";
import productVape from "@/assets/product-vape.jpg";
import productCigar from "@/assets/product-cigar.jpg";
import productHookah from "@/assets/product-hookah.jpg";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback mock data
  const mockProducts = [
    {
      id: 1,
      name: "Premium Disposable Vape - Mixed Berry",
      brand: "Elite Vapes",
      price: 24.99,
      image: productVape,
      inStock: true,
      category: "vapes",
    },
    {
      id: 2,
      name: "Luxury Cigar Collection Box",
      brand: "Royal Tobacco",
      price: 89.99,
      image: productCigar,
      inStock: true,
      category: "cigars",
    },
    {
      id: 3,
      name: "Premium Hookah Tobacco - Double Apple",
      brand: "Shisha Elite",
      price: 19.99,
      image: productHookah,
      inStock: true,
      category: "hookah",
    },
    {
      id: 4,
      name: "Premium Disposable Vape - Mango Ice",
      brand: "Elite Vapes",
      price: 24.99,
      image: productVape,
      inStock: true,
      category: "vapes",
    },
    {
      id: 5,
      name: "Premium Disposable Vape - Strawberry",
      brand: "Elite Vapes",
      price: 24.99,
      image: productVape,
      inStock: false,
      category: "vapes",
    },
    {
      id: 6,
      name: "Premium Cigar - Robusto",
      brand: "Royal Tobacco",
      price: 15.99,
      image: productCigar,
      inStock: true,
      category: "cigars",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const searchParam = searchParams.get("search");
        const response = await productsAPI.getAll({
          page: 1,
          page_size: 50,
          search: searchParam || undefined,
        });

        if (response && (response as any).products && Array.isArray((response as any).products)) {
          const mappedProducts = (response as any).products.map((item: any) => {
            // Ensure price is always a number
            const price = item.sale_price || item.price;
            const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;

            return {
              id: item.id,
              name: item.name,
              brand: item.brand || "Unknown Brand",
              price: numericPrice,
              image: item.image_url || productVape,
              inStock: item.stock_quantity > 0,
              category: "general", // Backend doesn't have category in product response
            };
          });
          setProducts(mappedProducts);
        } else {
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Using demo products - API connection unavailable");
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleLocalSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchParams({ search: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Our Products</h1>
        <p className="text-muted-foreground">Browse our premium selection</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleLocalSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px] bg-secondary border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vapes">Vapes</SelectItem>
            <SelectItem value="cigars">Cigars</SelectItem>
            <SelectItem value="hookah">Hookah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">No products found</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="border-primary"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
