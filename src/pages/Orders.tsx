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
            <Card key={order.id} className="border-border bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white self-start sm:self-auto`}>
                      {order.status}
                    </Badge>
                    <p className="text-2xl font-bold text-primary">
                      ${order.total_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items && order.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-secondary rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-center sm:text-left">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground text-center sm:text-left">
                          Quantity: {item.quantity} × ${item.unit_price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="font-bold text-lg">${item.subtotal?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary/90">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;