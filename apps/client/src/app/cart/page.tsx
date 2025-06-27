'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useCart, type CartItem } from '@/contexts/CartContext';
import { PropScholarNavbar } from '@/components/PropScholarNavbar';
import { toast } from 'sonner';

export default function CartPage() {
  const { 
    items, 
    isLoading, 
    error, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const getCartItemId = (item: CartItem) => {
    return 'productId' in item ? `${item.productId}-${item.variantId}` : `${item.product._id}-${item.variant._id}`;
  };

  const getCartItemDetails = (item: CartItem) => {
    if ('productId' in item) {
      // Local cart item
      return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      };
    } else {
      // API cart item
      return {
        productId: item.product._id,
        variantId: item.variant._id,
        name: item.product.name,
        price: item.variant.comparePrice || 0,
        image: item.product.images?.[0],
        quantity: item.quantity,
      };
    }
  };

  const handleUpdateQuantity = async (productId: string, variantId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId, variantId);
    } else {
      await updateQuantity(productId, variantId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: string, variantId: string) => {
    await removeFromCart(productId, variantId);
  };

  const handleClearCart = async () => {
    toast('Are you sure you want to clear your cart?', {
      action: {
        label: 'Clear Cart',
        onClick: async () => {
          await clearCart();
          toast.success('Cart cleared successfully');
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
        <PropScholarNavbar />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-prop-scholar-electric-blue animate-spin mx-auto mb-4" />
            <p className="text-prop-scholar-secondary-text">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
      <PropScholarNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => window.location.href = "/shop"}
            className="flex items-center gap-2 text-prop-scholar-secondary-text hover:text-prop-scholar-electric-blue transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-prop-scholar-main-text mb-8">
              Shopping Cart
            </h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-24 w-24 text-prop-scholar-secondary-text mx-auto mb-6" />
                <h3 className="text-prop-scholar-main-text font-bold text-2xl mb-4">
                  Your cart is empty
                </h3>
                <p className="text-prop-scholar-secondary-text mb-8">
                  Add some products to get started with your trading journey
                </p>
                <button
                  onClick={() => window.location.href = "/shop"}
                  className="px-6 py-3 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white rounded-xl font-medium transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const details = getCartItemDetails(item);
                    return (
                      <motion.div
                        key={getCartItemId(item)}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6"
                      >
                        <div className="flex items-center gap-6">
                          {/* Product Image */}
                          <div className="bg-gradient-to-br from-prop-scholar-electric-blue/20 to-prop-scholar-royal-blue/20 rounded-xl p-4 flex-shrink-0">
                            <div className="w-16 h-16 bg-prop-scholar-electric-blue/20 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-prop-scholar-electric-blue" />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="text-prop-scholar-main-text font-bold text-lg mb-2">
                              {details.name}
                            </h3>
                            <p className="text-prop-scholar-secondary-text">
                              Price: ${details.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateQuantity(details.productId, details.variantId, details.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-prop-scholar-main-text transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-prop-scholar-main-text font-medium w-8 text-center">
                              {details.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(details.productId, details.variantId, details.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-prop-scholar-main-text transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Total Price */}
                          <div className="text-right">
                            <p className="text-prop-scholar-main-text font-bold text-lg">
                              ${(details.price * details.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(details.productId, details.variantId)}
                            className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Cart Summary */}
                <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-prop-scholar-secondary-text">Total Items:</span>
                    <span className="text-prop-scholar-main-text font-medium">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-prop-scholar-main-text font-bold text-xl">Total:</span>
                    <span className="text-prop-scholar-main-text font-bold text-2xl">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleClearCart}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-prop-scholar-main-text rounded-xl font-medium transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => toast.info('Checkout functionality coming soon!')}
                      className="px-6 py-3 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white rounded-xl font-medium transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 