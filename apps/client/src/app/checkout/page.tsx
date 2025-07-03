"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CreditCard, 
  ShoppingCart, 
  Loader2,
  User,
  MapPin,
  FileText,
  AlertCircle
} from "lucide-react";
import { ordersApi, CreateOrderRequest, CustomerDetails, Address } from "@/lib/api/orders";

interface CheckoutFormData {
  customerDetails: CustomerDetails;
  shippingAddress: Address;
  billingAddress: Address;
  notes: string;
  useSameAddress: boolean;
}

export default function CheckoutPage() {
  const { items, totalItems, totalPrice } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerDetails: {
      name: "",
      email: "",
      phone: "",
    },
    shippingAddress: {
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
    billingAddress: {
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
    notes: "",
    useSameAddress: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
      toast.error('Your cart is empty');
    }
  }, [items.length, router]);

  // Handle form field changes
  const handleInputChange = (
    section: keyof CheckoutFormData | '',
    field: string,
    value: string | boolean
  ) => {
    if (section === '') {
      // Handle top-level properties like useSameAddress and notes
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as object),
          [field]: value,
        },
      }));
    }

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  // Copy shipping address to billing address
  useEffect(() => {
    if (formData.useSameAddress) {
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.shippingAddress },
      }));
    }
  }, [formData.useSameAddress, formData.shippingAddress]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer details validation
    if (!formData.customerDetails.name.trim()) {
      newErrors['customerDetails.name'] = 'Name is required';
    }
    if (!formData.customerDetails.email.trim()) {
      newErrors['customerDetails.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerDetails.email)) {
      newErrors['customerDetails.email'] = 'Email is invalid';
    }
    if (!formData.customerDetails.phone.trim()) {
      newErrors['customerDetails.phone'] = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.customerDetails.phone.replace(/\D/g, ''))) {
      newErrors['customerDetails.phone'] = 'Phone must be 10 digits';
    }

    // Shipping address validation
    if (!formData.shippingAddress.name.trim()) {
      newErrors['shippingAddress.name'] = 'Name is required';
    }
    if (!formData.shippingAddress.phone.trim()) {
      newErrors['shippingAddress.phone'] = 'Phone is required';
    }
    if (!formData.shippingAddress.address.trim()) {
      newErrors['shippingAddress.address'] = 'Address is required';
    }
    if (!formData.shippingAddress.city.trim()) {
      newErrors['shippingAddress.city'] = 'City is required';
    }
    if (!formData.shippingAddress.state.trim()) {
      newErrors['shippingAddress.state'] = 'State is required';
    }
    if (!formData.shippingAddress.zipCode.trim()) {
      newErrors['shippingAddress.zipCode'] = 'ZIP code is required';
    }

    // Billing address validation (if different from shipping)
    if (!formData.useSameAddress) {
      if (!formData.billingAddress.name.trim()) {
        newErrors['billingAddress.name'] = 'Name is required';
      }
      if (!formData.billingAddress.phone.trim()) {
        newErrors['billingAddress.phone'] = 'Phone is required';
      }
      if (!formData.billingAddress.address.trim()) {
        newErrors['billingAddress.address'] = 'Address is required';
      }
      if (!formData.billingAddress.city.trim()) {
        newErrors['billingAddress.city'] = 'City is required';
      }
      if (!formData.billingAddress.state.trim()) {
        newErrors['billingAddress.state'] = 'State is required';
      }
      if (!formData.billingAddress.zipCode.trim()) {
        newErrors['billingAddress.zipCode'] = 'ZIP code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout submission
  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/payment-result`;
      
      const orderRequest: CreateOrderRequest = {
        customerDetails: formData.customerDetails,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress,
        notes: formData.notes || undefined,
        redirectUrl,
      };

      const orderResponse = await ordersApi.createFromCart(orderRequest);

      // Store order ID for result page
      localStorage.setItem('pendingOrderId', orderResponse.order._id);

      // Redirect to PhonePe payment
      window.location.href = orderResponse.payment.redirectUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
      <PropScholarNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-prop-scholar-secondary-text hover:text-prop-scholar-electric-blue transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Customer Details */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-prop-scholar-electric-blue" />
                  <h2 className="text-prop-scholar-main-text font-bold text-xl">
                    Customer Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customerDetails.name}
                      onChange={(e) => handleInputChange('customerDetails', 'name', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['customerDetails.name'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors['customerDetails.name'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['customerDetails.name']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerDetails.phone}
                      onChange={(e) => handleInputChange('customerDetails', 'phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['customerDetails.phone'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors['customerDetails.phone'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['customerDetails.phone']}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.customerDetails.email}
                      onChange={(e) => handleInputChange('customerDetails', 'email', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['customerDetails.email'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors['customerDetails.email'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['customerDetails.email']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-6 w-6 text-prop-scholar-electric-blue" />
                  <h2 className="text-prop-scholar-main-text font-bold text-xl">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.name}
                      onChange={(e) => handleInputChange('shippingAddress', 'name', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['shippingAddress.name'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Recipient name"
                    />
                    {errors['shippingAddress.name'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.name']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['shippingAddress.phone'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Contact number"
                    />
                    {errors['shippingAddress.phone'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.phone']}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Address *
                    </label>
                    <textarea
                      value={formData.shippingAddress.address}
                      onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue resize-none ${
                        errors['shippingAddress.address'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="Street address, building name, floor, etc."
                    />
                    {errors['shippingAddress.address'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.address']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['shippingAddress.city'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="City"
                    />
                    {errors['shippingAddress.city'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.city']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.state}
                      onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['shippingAddress.state'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="State"
                    />
                    {errors['shippingAddress.state'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.state']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.zipCode}
                      onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                        errors['shippingAddress.zipCode'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                      }`}
                      placeholder="ZIP Code"
                    />
                    {errors['shippingAddress.zipCode'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['shippingAddress.zipCode']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-prop-scholar-electric-blue" />
                    <h2 className="text-prop-scholar-main-text font-bold text-xl">
                      Billing Address
                    </h2>
                  </div>
                  
                  <label className="flex items-center gap-2 text-prop-scholar-secondary-text">
                    <input
                      type="checkbox"
                      checked={formData.useSameAddress}
                      onChange={(e) => handleInputChange('', 'useSameAddress', e.target.checked)}
                      className="w-4 h-4 text-prop-scholar-electric-blue bg-white/10 border-prop-scholar-electric-blue/30 rounded focus:ring-prop-scholar-electric-blue"
                    />
                    <span>Same as shipping address</span>
                  </label>
                </div>

                {!formData.useSameAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Billing address fields - similar to shipping address */}
                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.name}
                        onChange={(e) => handleInputChange('billingAddress', 'name', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                          errors['billingAddress.name'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="Full name"
                      />
                      {errors['billingAddress.name'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.name']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.billingAddress.phone}
                        onChange={(e) => handleInputChange('billingAddress', 'phone', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                          errors['billingAddress.phone'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="Phone number"
                      />
                      {errors['billingAddress.phone'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.phone']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.billingAddress.address}
                        onChange={(e) => handleInputChange('billingAddress', 'address', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue resize-none ${
                          errors['billingAddress.address'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="Street address, building name, floor, etc."
                      />
                      {errors['billingAddress.address'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.address']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                          errors['billingAddress.city'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="City"
                      />
                      {errors['billingAddress.city'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.city']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                          errors['billingAddress.state'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="State"
                      />
                      {errors['billingAddress.state'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.state']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.zipCode}
                        onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue ${
                          errors['billingAddress.zipCode'] ? 'border-red-500' : 'border-prop-scholar-electric-blue/30'
                        }`}
                        placeholder="ZIP Code"
                      />
                      {errors['billingAddress.zipCode'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['billingAddress.zipCode']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-prop-scholar-secondary-text text-sm font-medium mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.country}
                        onChange={(e) => handleInputChange('billingAddress', 'country', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-prop-scholar-electric-blue" />
                  <h2 className="text-prop-scholar-main-text font-bold text-xl">
                    Additional Notes
                  </h2>
                </div>

                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('', 'notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:outline-none focus:border-prop-scholar-electric-blue resize-none"
                  placeholder="Any special instructions or notes for this order..."
                />
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Cart Items */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="h-6 w-6 text-prop-scholar-electric-blue" />
                  <h2 className="text-prop-scholar-main-text font-bold text-xl">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map((item: any) => (
                    <div key={`${item.productId || item.product?._id}-${item.variantId || item.variant?._id}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <h3 className="text-prop-scholar-main-text font-medium mb-1">
                          {item.name || item.product?.name}
                        </h3>
                        <p className="text-prop-scholar-secondary-text text-sm">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-prop-scholar-main-text font-bold">
                          ₹{((item.price || item.variant?.comparePrice || 0) * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-prop-scholar-secondary-text text-sm">
                          ₹{(item.price || item.variant?.comparePrice || 0).toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-prop-scholar-electric-blue/20 pt-4 space-y-3">
                  <div className="flex justify-between text-prop-scholar-secondary-text">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-prop-scholar-secondary-text">
                    <span>Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-prop-scholar-secondary-text">
                    <span>Shipping</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-prop-scholar-secondary-text">
                    <span>Discount</span>
                    <span>-₹0</span>
                  </div>
                  <div className="border-t border-prop-scholar-electric-blue/20 pt-3">
                    <div className="flex justify-between text-prop-scholar-main-text font-bold text-lg">
                      <span>Total</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-prop-scholar-electric-blue" />
                  <h3 className="text-prop-scholar-main-text font-bold text-lg">
                    Payment Method
                  </h3>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-prop-scholar-electric-blue rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-prop-scholar-main-text font-medium">PhonePe</span>
                  </div>
                  <p className="text-prop-scholar-secondary-text text-sm">
                    Secure payment powered by PhonePe. Supports UPI, Cards, Net Banking & more.
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 bg-prop-scholar-electric-blue/10 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-prop-scholar-electric-blue mt-0.5" />
                  <div>
                    <p className="text-prop-scholar-main-text text-sm font-medium">
                      Secure Payment
                    </p>
                    <p className="text-prop-scholar-secondary-text text-xs">
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(36,107,253,0.3)] hover:shadow-[0_0_40px_rgba(36,107,253,0.5)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6" />
                    Pay ₹{totalPrice.toLocaleString()}
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 