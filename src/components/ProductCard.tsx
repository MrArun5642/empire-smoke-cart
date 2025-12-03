import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  inStock: boolean;
}

export const ProductCard = ({ id, name, brand, price, image, inStock }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      image
    }, 1);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border bg-gradient-card hover:shadow-premium transition-all duration-300"
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-primary font-medium mb-1 truncate">{brand}</p>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm sm:text-base">{name}</h3>
        <p className="text-xl sm:text-2xl font-bold text-primary">${(price || 0).toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!inStock}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          {inStock ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
