import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EMPIRE SMOKE
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/brands" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Brands
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="relative hover:bg-secondary"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-secondary">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Sign In
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </form>
            <Link
              to="/products"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/brands"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Brands
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
