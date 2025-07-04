"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { MagicCard } from "@/components/magicui/magic-card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { 
  Search, 
  Star, 
  ShoppingCart,
  Users,
  Target,
  Clock,
  DollarSign,
  Loader2
} from "lucide-react";
import { categoriesApi, productsApi, Product, Category, variantsApi, Variant } from "@/lib/api";

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getAll({ limit: 100 }) // Get all products for now
        ]);
        
        setCategories(categoriesData.categories);
        setProducts(productsData.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category._id === selectedCategory;
      
      return matchesSearch && matchesCategory && product.isActive;
    });

    // Sort products
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "category":
        filtered.sort((a, b) => a.category.name.localeCompare(b.category.name));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        });
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = async (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('This product has no available variants');
      return;
    }

    try {
      // Fetch the first variant details to get pricing
      const firstVariant: Variant = await variantsApi.getById(product.variants[0]._id);
      
      await addToCart({
        productId: product._id,
        variantId: firstVariant._id,
        quantity: 1,
        name: product.name,
        price: firstVariant.comparePrice || 0,
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
            <p className="text-prop-scholar-secondary-text">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
        <PropScholarNavbar />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-prop-scholar-main-text font-bold text-2xl mb-2">
              Error Loading Products
            </h1>
            <p className="text-prop-scholar-secondary-text mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-prop-scholar-electric-blue hover:bg-prop-scholar-royal-blue text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                Get funded with top prop firms. Choose from multiple evaluation programs
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
                { icon: Users, label: "Trading Firms", value: categories.length.toString() },
                { icon: Target, label: "Products Available", value: products.length.toString() },
                { icon: DollarSign, label: "Active Products", value: products.filter(p => p.isActive).length.toString() },
                { icon: Clock, label: "Featured Products", value: products.filter(p => p.isFeatured).length.toString() },
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
              Trading Firms
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category._id)}
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
                          {category.products.length} products available
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
                    <option key={category._id} value={category._id}>
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
                  <option value="featured">Featured First</option>
                  <option value="name">Name A-Z</option>
                  <option value="category">By Category</option>
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
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <MagicCard className="h-full bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 hover:border-prop-scholar-electric-blue/40 transition-all duration-300">
                    <div className="p-6 h-full flex flex-col">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        {product.isFeatured && (
                          <span className="bg-prop-scholar-electric-blue text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                        <span className="bg-white/10 text-prop-scholar-main-text px-2 py-1 rounded-full text-xs font-medium">
                          {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div className="bg-gradient-to-br from-prop-scholar-electric-blue/20 to-prop-scholar-royal-blue/20 rounded-xl p-6 mb-4 text-center">
                        <div className="text-prop-scholar-electric-blue font-bold text-xl mb-2">
                          {product.category.name}
                        </div>
                        <div className="text-prop-scholar-main-text font-medium text-sm">
                          {product.tags.join(' • ')}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="text-prop-scholar-main-text font-bold text-lg mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-prop-scholar-secondary-text text-sm mb-4 line-clamp-3">
                          {product.description}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => window.location.href = `/shop/${product._id}`}
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