"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { MagicCard } from "@/components/magicui/magic-card";
import { useCart } from "@/contexts/CartContext";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  ShoppingCart, 
  Check,
  Clock,
  Target,
  Calendar,
  Shield,
  Zap
} from "lucide-react";
import productsData from "@/data/products.json";

interface Product {
  id: string;
  firmId: string;
  firmName: string;
  amount: string;
  phase: number;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  popular: boolean;
  featured: boolean;
  rules: any;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  
  const { products }: { products: Product[] } = productsData;
  
  // Find the current product and its variants
  const currentProduct = products.find(p => p.id === productId);
  
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(currentProduct || null);
  
  // Find all variants (same firm and amount, different phases)
  const variants = useMemo(() => {
    if (!currentProduct) return [];
    
    return products.filter(p => 
      p.firmId === currentProduct.firmId && 
      p.amount === currentProduct.amount
    );
  }, [currentProduct, products]);

  // Find related products (same firm, different amounts)
  const relatedProducts = useMemo(() => {
    if (!currentProduct) return [];
    
    return products.filter(p => 
      p.firmId === currentProduct.firmId && 
      p.amount !== currentProduct.amount
    ).slice(0, 4);
  }, [currentProduct, products]);

  if (!currentProduct || !selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-prop-scholar-main-text font-bold text-2xl mb-2">
            Product Not Found
          </h1>
          <p className="text-prop-scholar-secondary-text">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => window.location.href = "/shop"}
            className="mt-6 px-6 py-3 bg-prop-scholar-electric-blue hover:bg-prop-scholar-royal-blue text-white rounded-xl font-medium transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariant.id,
      name: selectedVariant.title,
      price: selectedVariant.discountedPrice,
      image: selectedVariant.image,
    });
  };

  const renderRules = (rules: any) => {
    if (selectedVariant.phase === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Target className="h-6 w-6 text-prop-scholar-electric-blue mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.profitTarget}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Profit Target</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Shield className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.maxDailyLoss}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Max Daily Loss</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Shield className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.maxTotalLoss}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Max Total Loss</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Clock className="h-6 w-6 text-prop-scholar-amber-yellow mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.tradingPeriod}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Trading Period</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Calendar className="h-6 w-6 text-prop-scholar-amber-yellow mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.minTradingDays}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Min Trading Days</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Zap className="h-6 w-6 text-prop-scholar-electric-blue mx-auto mb-2" />
              <div className="text-prop-scholar-main-text font-bold">{rules.leverage}</div>
              <div className="text-prop-scholar-secondary-text text-sm">Leverage</div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {/* Phase 1 */}
          <div>
            <h4 className="text-prop-scholar-main-text font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-prop-scholar-electric-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              Phase 1 - Challenge
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Target className="h-5 w-5 text-prop-scholar-electric-blue mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase1.profitTarget}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Profit Target</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Shield className="h-5 w-5 text-red-400 mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase1.maxDailyLoss}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Max Daily Loss</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Clock className="h-5 w-5 text-prop-scholar-amber-yellow mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase1.tradingPeriod}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Trading Period</div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div>
            <h4 className="text-prop-scholar-main-text font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-prop-scholar-amber-yellow text-prop-scholar-deep-navy rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              Phase 2 - Verification
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Target className="h-5 w-5 text-prop-scholar-electric-blue mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase2.profitTarget}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Profit Target</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Shield className="h-5 w-5 text-red-400 mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase2.maxDailyLoss}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Max Daily Loss</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Clock className="h-5 w-5 text-prop-scholar-amber-yellow mx-auto mb-2" />
                <div className="text-prop-scholar-main-text font-bold">{rules.phase2.tradingPeriod}</div>
                <div className="text-prop-scholar-secondary-text text-xs">Trading Period</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

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
                <div className="text-prop-scholar-electric-blue font-bold text-6xl mb-4">
                  ${selectedVariant.amount}
                </div>
                <div className="text-prop-scholar-main-text font-bold text-2xl mb-2">
                  {selectedVariant.firmName}
                </div>
                <div className="text-prop-scholar-secondary-text">
                  {selectedVariant.phase} Step Evaluation
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                {selectedVariant.popular && (
                  <span className="bg-prop-scholar-amber-yellow text-prop-scholar-deep-navy px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Most Popular
                  </span>
                )}
                {selectedVariant.featured && (
                  <span className="bg-prop-scholar-electric-blue text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Featured
                  </span>
                )}
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {selectedVariant.discount}% OFF
                </span>
              </div>

              {/* Product Title and Description */}
              <h1 className="text-prop-scholar-main-text font-bold text-3xl mb-4">
                {selectedVariant.title}
              </h1>
              <p className="text-prop-scholar-secondary-text text-lg mb-8">
                {selectedVariant.description}
              </p>

              {/* Key Features */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                  What&apos;s Included
                </h3>
                <div className="space-y-3">
                  {[
                    "Real-time performance tracking",
                    "24/7 trading support",
                    "No time restrictions",
                    "Instant account funding upon passing",
                    "Up to 80% profit sharing",
                    "Risk management tools"
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
              {variants.length > 1 && (
                <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                  <h3 className="text-prop-scholar-main-text font-bold text-lg mb-4">
                    Choose Your Evaluation Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedVariant.id === variant.id
                            ? "border-prop-scholar-electric-blue bg-prop-scholar-electric-blue/10"
                            : "border-prop-scholar-electric-blue/30 hover:border-prop-scholar-electric-blue/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-prop-scholar-main-text font-bold">
                            {variant.phase} Step
                          </span>
                          <span className="text-prop-scholar-electric-blue font-bold">
                            ${variant.discountedPrice}
                          </span>
                        </div>
                        <p className="text-prop-scholar-secondary-text text-sm">
                          {variant.phase === 1 
                            ? "Single evaluation phase - faster path to funding"
                            : "Two-phase evaluation - more structured approach"
                          }
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-prop-scholar-secondary-text text-2xl line-through">
                      ${selectedVariant.originalPrice}
                    </span>
                    <span className="text-prop-scholar-main-text font-bold text-4xl">
                      ${selectedVariant.discountedPrice}
                    </span>
                  </div>
                  <p className="text-green-400 font-bold">
                    You save ${selectedVariant.originalPrice - selectedVariant.discountedPrice} ({selectedVariant.discount}% off)
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
                    🔒 Secure payment • 💰 30-day money back guarantee
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Shield, text: "Secure Payment" },
                  { icon: Check, text: "Instant Access" },
                  { icon: Star, text: "5-Star Support" }
                ].map((indicator, index) => (
                  <div key={index} className="text-center p-4 bg-white/5 rounded-xl">
                    <indicator.icon className="h-6 w-6 text-prop-scholar-electric-blue mx-auto mb-2" />
                    <p className="text-prop-scholar-secondary-text text-sm">{indicator.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Evaluation Rules */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-8">
              <h2 className="text-prop-scholar-main-text font-bold text-2xl mb-8 text-center">
                Evaluation Rules & Requirements
              </h2>
              {renderRules(selectedVariant.rules)}
            </div>
          </motion.section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-prop-scholar-main-text font-bold text-2xl mb-8">
                Other {selectedVariant.firmName} Evaluations
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => window.location.href = `/shop/${product.id}`}
                  >
                    <MagicCard
                      className="p-6 h-full bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 hover:border-prop-scholar-electric-blue/40 transition-all duration-300"
                    >
                      <div className="text-center mb-4">
                        <div className="text-prop-scholar-electric-blue font-bold text-2xl mb-2">
                          ${product.amount}
                        </div>
                        <div className="text-prop-scholar-main-text font-medium">
                          {product.phase} Step
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-prop-scholar-secondary-text text-sm line-through">
                          ${product.originalPrice}
                        </div>
                        <div className="text-prop-scholar-main-text font-bold text-lg">
                          ${product.discountedPrice}
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
} 