import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, ArrowLeft, Star, Package, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [productResponse, priceResponse] = await Promise.all([
          productsAPI.getById(id),
          user ? productsAPI.getPrice(id).catch(() => null) : Promise.resolve(null)
        ]);

        setProduct(productResponse);

        // Handle price - use authenticated price if available, otherwise use product price
        const productResponseTyped = productResponse as any;
        const priceResponseTyped = priceResponse as any;
        const productPrice = priceResponseTyped?.price || productResponseTyped.price || productResponseTyped.sale_price || 0;
        const numericPrice = typeof productPrice === 'number' ? productPrice : parseFloat(productPrice) || 0;
        setPrice(numericPrice);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product details");
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, user, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: price,
        image: product.image_url || "https://placehold.co/400x400"
      }, quantity);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            <img
              src={product.image_url || "https://placehold.co/600x600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{product.brand || "Unknown Brand"}</p>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">${price.toFixed(2)}</span>
              {product.sale_price && product.price && product.sale_price < product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.is_featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="font-medium text-sm sm:text-base">Quantity:</label>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0"
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>

          {/* Product Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span>{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span>{product.stock_quantity} available</span>
              </div>
              {product.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;