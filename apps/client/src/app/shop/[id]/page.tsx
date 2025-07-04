"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { useCart } from "@/contexts/CartContext";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Check,
  Shield,
  Loader2,
  Package
} from "lucide-react";
import { productsApi, ProductDetail, variantsApi, Variant } from "@/lib/api";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productsApi.getById(productId);
        setProduct(productData);
        
        // Set first variant as default if available
        if (productData.variants.length > 0) {
          const variantData = await variantsApi.getById(productData.variants[0]._id);
          setSelectedVariant(variantData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle variant selection
  const handleVariantSelect = async (variantId: string) => {
    try {
      const variantData = await variantsApi.getById(variantId);
      setSelectedVariant(variantData);
    } catch (err) {
      console.error('Failed to fetch variant:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
    
    try {
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: 1,
        name: product.name,
        price: selectedVariant.comparePrice || 0,
        image: product.images?.[0],
      });
      
      // Optional: Show success feedback
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
        <PropScholarNavbar />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-prop-scholar-electric-blue animate-spin mx-auto mb-4" />
            <p className="text-prop-scholar-secondary-text">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
        <PropScholarNavbar />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-prop-scholar-main-text font-bold text-2xl mb-2">
              Product Not Found
            </h1>
            <p className="text-prop-scholar-secondary-text mb-4">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => window.location.href = "/shop"}
              className="px-6 py-3 bg-prop-scholar-electric-blue hover:bg-prop-scholar-royal-blue text-white rounded-xl font-medium transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
      <PropScholarNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => window.location.href = "/shop"}
            className="flex items-center gap-2 text-prop-scholar-secondary-text hover:text-prop-scholar-electric-blue transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Shop
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image and Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Product Image */}
              <div className="bg-gradient-to-br from-prop-scholar-electric-blue/20 to-prop-scholar-royal-blue/20 rounded-3xl p-12 mb-8 text-center">
                <div className="text-prop-scholar-electric-blue font-bold text-4xl mb-4">
                  {product.category.name}
                </div>
                <div className="text-prop-scholar-main-text font-bold text-xl mb-2">
                  {selectedVariant?.name || 'Select Variant'}
                </div>
                <div className="text-prop-scholar-secondary-text">
                  {product.tags.join(' • ')}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                {product.isFeatured && (
                  <span className="bg-prop-scholar-electric-blue text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Featured
                  </span>
                )}
                <span className="bg-white/10 text-prop-scholar-main-text px-4 py-2 rounded-full text-sm font-bold">
                  {product.variants.length} Variant{product.variants.length !== 1 ? 's' : ''} Available
                </span>
              </div>

              {/* Product Title and Description */}
              <h1 className="text-prop-scholar-main-text font-bold text-3xl mb-4">
                {product.name}
              </h1>
              <p className="text-prop-scholar-secondary-text text-lg mb-8">
                {product.description}
              </p>

              {/* Key Features */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                  What&apos;s Included
                </h3>
                <div className="space-y-3">
                  {[
                    "Professional trading evaluation",
                    "Real-time performance tracking",
                    "Comprehensive rule set",
                    "Multi-phase assessment program",
                    "Detailed progress monitoring",
                    "Professional support"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400" />
                      <span className="text-prop-scholar-secondary-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Purchase Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Variant Selection */}
              {product.variants.length > 1 && (
                <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                  <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                    Choose Your Option
                  </h3>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => handleVariantSelect(variant._id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedVariant?._id === variant._id
                            ? "border-prop-scholar-electric-blue bg-prop-scholar-electric-blue/10"
                            : "border-prop-scholar-electric-blue/30 hover:border-prop-scholar-electric-blue/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-prop-scholar-main-text font-bold">
                            {variant.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-prop-scholar-electric-blue" />
                            <span className="text-prop-scholar-electric-blue font-bold">
                              Select
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {selectedVariant && (
                <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-prop-scholar-main-text font-bold text-4xl mb-2">
                      Rs {selectedVariant.comparePrice}
                    </div>
                    <p className="text-prop-scholar-secondary-text">
                      {selectedVariant.name} - {product.category.name}
                    </p>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(36,107,253,0.3)] hover:shadow-[0_0_40px_rgba(36,107,253,0.5)] transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Add to Cart
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-prop-scholar-secondary-text text-sm">
                      🔒 Secure payment • 💰 Professional evaluation
                    </p>
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Shield, text: "Secure Payment" },
                  { icon: Check, text: "Instant Access" },
                  { icon: Star, text: "Professional" }
                ].map((indicator, index) => (
                  <div key={index} className="text-center p-4 bg-white/5 rounded-xl">
                    <indicator.icon className="h-6 w-6 text-prop-scholar-electric-blue mx-auto mb-2" />
                    <p className="text-prop-scholar-secondary-text text-sm">{indicator.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Product Details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-8">
              <h2 className="text-prop-scholar-main-text font-bold text-2xl mb-8 text-center">
                Product Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                    Category Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-prop-scholar-secondary-text">Trading Firm:</span>
                      <span className="text-prop-scholar-main-text font-medium">{product.category.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-prop-scholar-secondary-text">Active Status:</span>
                      <span className={`font-medium ${product.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-prop-scholar-secondary-text">Featured:</span>
                      <span className={`font-medium ${product.isFeatured ? 'text-prop-scholar-electric-blue' : 'text-prop-scholar-secondary-text'}`}>
                        {product.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                    Available Options
                  </h3>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div key={variant._id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-prop-scholar-main-text font-medium">{variant.name}</span>
                          <button
                            onClick={() => handleVariantSelect(variant._id)}
                            className="text-prop-scholar-electric-blue hover:text-prop-scholar-royal-blue text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO Information */}
              {product.seoDescription && (
                <div className="mt-8 pt-8 border-t border-prop-scholar-electric-blue/20">
                  <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                    Additional Information
                  </h3>
                  <p className="text-prop-scholar-secondary-text mb-4">
                    {product.seoDescription}
                  </p>
                  {product.seoKeywords && product.seoKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.seoKeywords.map((keyword: string, index: number) => (
                        <span key={index} className="bg-prop-scholar-electric-blue/20 text-prop-scholar-main-text px-3 py-1 rounded-full text-sm">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
} 