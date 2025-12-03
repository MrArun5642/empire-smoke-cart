import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                   <Route path="/" element={<Home />} />
                   <Route path="/auth" element={<Auth />} />
                   <Route path="/products" element={<Products />} />
                   <Route path="/products/:id" element={<ProductDetail />} />
                   <Route path="/categories" element={<Categories />} />
                   <Route path="/brands" element={<Brands />} />
                   <Route path="/about" element={<About />} />
                   <Route path="/contact" element={<Contact />} />
                   <Route path="/shipping" element={<Shipping />} />
                   <Route path="/privacy" element={<Privacy />} />
                   <Route path="/terms" element={<Terms />} />
                   <Route path="/orders" element={<Orders />} />
                   <Route path="/profile" element={<Profile />} />
                   <Route path="/admin" element={<Admin />} />
                   <Route path="/cart" element={<Cart />} />
                   <Route path="/checkout" element={<Checkout />} />
                   {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                   <Route path="*" element={<NotFound />} />
                 </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
