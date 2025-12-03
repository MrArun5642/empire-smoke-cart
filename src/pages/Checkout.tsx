import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ordersAPI } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
    const { items, cartCount, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simplified for demo - in real app would fetch addresses
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        paymentMethod: "credit_card"
    });

    const subtotal = items.reduce((acc, item) => acc + (item.product.base_price * item.quantity), 0);
    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Create address (skipped for demo, assuming IDs 1 and 1 exist or creating dummy)
            // In a real flow, we'd POST to /api/v1/users/addresses first

            // 2. Create order
            // Using dummy address IDs for now as per API requirement
            await ordersAPI.create(1, 1, formData.paymentMethod);

            toast.success("Order placed successfully!");
            await clearCart();
            navigate("/profile"); // Redirect to orders list
        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartCount === 0) {
        navigate("/cart");
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-card border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        required
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        required
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input
                                        id="zip"
                                        required
                                        value={formData.zip}
                                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <RadioGroup
                                defaultValue="credit_card"
                                onValueChange={val => setFormData({ ...formData, paymentMethod: val })}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="credit_card" id="credit_card" />
                                    <Label htmlFor="credit_card">Credit Card</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="paypal" id="paypal" />
                                    <Label htmlFor="paypal">PayPal</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button type="submit" className="w-full lg:hidden" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : `Place Order ($${total.toFixed(2)})`}
                        </Button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-lg p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-2 mb-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="line-clamp-1">{item.product.product_name} x{item.quantity}</span>
                                    <span>${(item.product.base_price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                            </div>
                        </div>
                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full hidden lg:flex"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Place Order"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
