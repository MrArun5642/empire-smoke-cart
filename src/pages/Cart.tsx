import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const { items, updateQuantity, removeFromCart, cartCount, isLoading } = useCart();
    const navigate = useNavigate();

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (isLoading) {
        return <div className="container mx-auto px-4 py-8">Loading cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Button onClick={() => navigate('/products')}>Start Shopping</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartCount} items)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card">
                            <div className="w-full sm:w-24 h-48 sm:h-24 bg-secondary rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-sm sm:text-base pr-2 line-clamp-2">{item.name}</h3>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                                    <div className="flex items-center gap-2 border rounded-md p-1 self-start">
                                        <button
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="p-1 hover:bg-secondary rounded"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 hover:bg-secondary rounded"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-lg p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                        </div>
                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
