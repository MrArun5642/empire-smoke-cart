import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ordersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Package, Calendar, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll();
        setOrders(response as any[]);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your order history</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-border bg-card hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground">Order #{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1 text-sm font-medium`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-3xl font-bold text-primary">
                        ${order.total_amount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2">
                    Order Items ({order.items?.length || 0})
                  </h4>
                  {order.items && order.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 shadow-sm">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-foreground text-center sm:text-left line-clamp-2">{item.product_name}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-center sm:text-left">Qty: {item.quantity}</span>
                          <span className="hidden sm:block">×</span>
                          <span className="text-center sm:text-left">${item.unit_price?.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="font-bold text-xl text-primary">${item.subtotal?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20">
          <CardContent className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No orders yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start exploring our premium collection of tobacco and vape products to begin your shopping journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
              <Button variant="outline" onClick={() => navigate('/categories')} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg">
                View Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;