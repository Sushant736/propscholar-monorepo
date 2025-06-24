"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { MagicCard } from "@/components/magicui/magic-card";
import { useCart } from "@/contexts/CartContext";
import { 
  Search, 
  Star, 
  TrendingUp, 
  ShoppingCart,
  Users,
  Target,
  Clock,
  DollarSign
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

interface Category {
  id: string;
  name: string;
  description: string;
  logo: string;
  featured: boolean;
}

interface GroupedProduct {
  id: string;
  firmId: string;
  firmName: string;
  amount: string;
  title: string;
  description: string;
  image: string;
  minPrice: number;
  maxPrice: number;
  minOriginalPrice: number;
  maxOriginalPrice: number;
  popular: boolean;
  featured: boolean;
  variants: Product[];
  profitTarget: string;
  maxDiscount: number;
}

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const { addToCart } = useCart();

  const { categories, products }: { categories: Category[], products: Product[] } = productsData;

  // Group products by firmId and amount
  const groupedProducts = useMemo(() => {
    const grouped = new Map<string, GroupedProduct>();

    products.forEach(product => {
      const key = `${product.firmId}-${product.amount}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          firmId: product.firmId,
          firmName: product.firmName,
          amount: product.amount,
          title: `${product.firmName} ${product.amount}`,
          description: product.description,
          image: product.image,
          minPrice: product.discountedPrice,
          maxPrice: product.discountedPrice,
          minOriginalPrice: product.originalPrice,
          maxOriginalPrice: product.originalPrice,
          popular: product.popular,
          featured: product.featured,
          variants: [product],
          profitTarget: product.rules.profitTarget || product.rules.phase1?.profitTarget || "N/A",
          maxDiscount: product.discount
        });
      } else {
        const existing = grouped.get(key)!;
        existing.variants.push(product);
        existing.minPrice = Math.min(existing.minPrice, product.discountedPrice);
        existing.maxPrice = Math.max(existing.maxPrice, product.discountedPrice);
        existing.minOriginalPrice = Math.min(existing.minOriginalPrice, product.originalPrice);
        existing.maxOriginalPrice = Math.max(existing.maxOriginalPrice, product.originalPrice);
        existing.popular = existing.popular || product.popular;
        existing.featured = existing.featured || product.featured;
        existing.maxDiscount = Math.max(existing.maxDiscount, product.discount);
      }
    });

    return Array.from(grouped.values());
  }, [products]);

  // Filter and sort grouped products
  const filteredProducts = useMemo(() => {
    const filtered = groupedProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.firmName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.firmId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.maxPrice - a.maxPrice);
        break;
      case "discount":
        filtered.sort((a, b) => b.maxDiscount - a.maxDiscount);
        break;
      case "popular":
      default:
        filtered.sort((a, b) => {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return filtered;
  }, [groupedProducts, searchTerm, selectedCategory, sortBy]);

  // const featuredProducts = groupedProducts.filter(p => p.featured);
  // const popularProducts = groupedProducts.filter(p => p.popular);

  const handleAddToCart = (product: GroupedProduct) => {
    // Add the cheapest variant (2-step) to cart by default
    const cheapestVariant = product.variants.reduce((prev, current) => 
      prev.discountedPrice < current.discountedPrice ? prev : current
    );
    
    addToCart({
      id: cheapestVariant.id,
      name: cheapestVariant.title,
      price: cheapestVariant.discountedPrice,
      image: cheapestVariant.image,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
      <PropScholarNavbar />
      
      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-prop-scholar-main-text mb-4">
                Prop Trading
                <span className="bg-gradient-to-r from-prop-scholar-electric-blue to-prop-scholar-amber-yellow bg-clip-text text-transparent"> Evaluations</span>
              </h1>
              <p className="text-xl text-prop-scholar-secondary-text max-w-3xl mx-auto">
                Get funded with top prop firms at up to 75% discount. Choose from multiple evaluation programs
                and start your funded trading journey today.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
              {[
                { icon: Users, label: "Active Traders", value: "10,000+" },
                { icon: Target, label: "Success Rate", value: "78%" },
                { icon: DollarSign, label: "Capital Deployed", value: "$50M+" },
                { icon: Clock, label: "Avg. Evaluation", value: "14 days" },
              ].map((stat, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-4">
                  <stat.icon className="h-6 w-6 text-prop-scholar-electric-blue mx-auto mb-2" />
                  <p className="text-prop-scholar-main-text font-bold text-lg">{stat.value}</p>
                  <p className="text-prop-scholar-secondary-text text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-prop-scholar-main-text mb-8"
            >
              Featured Firms
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.filter(cat => cat.featured).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <MagicCard className="p-6 h-full bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 hover:border-prop-scholar-electric-blue/40 transition-all duration-300">
                      <div className="text-center">
                        <div className="bg-prop-scholar-electric-blue/20 rounded-2xl p-4 w-fit mx-auto mb-4">
                          <div className="h-8 w-8 bg-prop-scholar-electric-blue rounded-lg" />
                        </div>
                        <h3 className="text-prop-scholar-main-text font-bold text-lg mb-2">
                          {category.name}
                        </h3>
                        <p className="text-prop-scholar-secondary-text text-sm">
                          {category.description}
                        </p>
                      </div>
                    </MagicCard>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-prop-scholar-secondary-text" />
                  <input
                    type="text"
                    placeholder="Search evaluations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:border-prop-scholar-electric-blue focus:outline-none"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text focus:border-prop-scholar-electric-blue focus:outline-none"
                >
                  <option value="all">All Firms</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-prop-scholar-electric-blue/30 rounded-xl text-prop-scholar-main-text focus:border-prop-scholar-electric-blue focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-prop-scholar-main-text">
                Available Evaluations ({filteredProducts.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <MagicCard className="h-full bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 hover:border-prop-scholar-electric-blue/40 transition-all duration-300">
                    <div className="p-6 h-full flex flex-col">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        {product.popular && (
                          <span className="bg-prop-scholar-amber-yellow text-prop-scholar-deep-navy px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Popular
                          </span>
                        )}
                        {product.featured && (
                          <span className="bg-prop-scholar-electric-blue text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                        <span className="bg-white/10 text-prop-scholar-main-text px-2 py-1 rounded-full text-xs font-medium">
                          {product.variants.length > 1 ? "1 & 2 Step" : `${product.variants[0].phase} Step`}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div className="bg-gradient-to-br from-prop-scholar-electric-blue/20 to-prop-scholar-royal-blue/20 rounded-xl p-6 mb-4 text-center">
                        <div className="text-prop-scholar-electric-blue font-bold text-2xl mb-2">
                          ${product.amount}
                        </div>
                        <div className="text-prop-scholar-main-text font-medium">
                          {product.firmName}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="text-prop-scholar-main-text font-bold text-lg mb-2">
                          {product.title}
                        </h3>
                        <p className="text-prop-scholar-secondary-text text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Key Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-prop-scholar-electric-blue font-bold text-sm">
                              {product.profitTarget}
                            </div>
                            <div className="text-prop-scholar-secondary-text text-xs">
                              Profit Target
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-prop-scholar-amber-yellow font-bold text-sm">
                              Up to {product.maxDiscount}%
                            </div>
                            <div className="text-prop-scholar-secondary-text text-xs">
                              Discount
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            {product.variants.length > 1 ? (
                              <>
                                <span className="text-prop-scholar-secondary-text text-sm line-through">
                                  ${product.minOriginalPrice}-${product.maxOriginalPrice}
                                </span>
                                <span className="text-prop-scholar-main-text font-bold text-xl ml-2">
                                  ${product.minPrice}-${product.maxPrice}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-prop-scholar-secondary-text text-sm line-through">
                                  ${product.minOriginalPrice}
                                </span>
                                <span className="text-prop-scholar-main-text font-bold text-xl ml-2">
                                  ${product.minPrice}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => window.location.href = `/shop/${product.variants[0].id}`}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-prop-scholar-main-text rounded-lg font-medium transition-colors text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-3 py-2 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-prop-scholar-main-text font-bold text-xl mb-2">
                  No evaluations found
                </h3>
                <p className="text-prop-scholar-secondary-text">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 