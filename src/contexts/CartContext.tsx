import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: { id: string; name: string; price: number; image: string }, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshCart = async () => {
        if (!user) {
            setItems([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await cartAPI.get() as any;
            const mappedItems = (response.items || []).map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                image: item.image_url || "https://placehold.co/100x100",
            }));
            setItems(mappedItems);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [user]);

    const addToCart = async (product: { id: string; name: string; price: number; image: string }, quantity = 1) => {
        try {
            await cartAPI.addItem(product.id, quantity);
            toast.success("Added to cart");
            refreshCart();
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            await cartAPI.removeItem(itemId);
            toast.success("Removed from cart");
            refreshCart();
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        try {
            await cartAPI.updateItem(itemId, quantity);
            refreshCart();
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setItems([]);
            toast.success("Cart cleared");
        } catch (error) {
            toast.error("Failed to clear cart");
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
