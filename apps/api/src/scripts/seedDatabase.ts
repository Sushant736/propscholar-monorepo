import 'dotenv/config';
import XLSX from 'xlsx';
import path from 'path';
import mongoose from 'mongoose';
import { database } from '../config/database.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Variant } from '../models/Variant.js';

interface ExcelRow {
  name: string;
  description: string;
  image: string;
  category: string;
  tags: string;
  'varient 1 name': string;
  'varient 1 price': number;
  'varient 2 name': string;
  'varient 2 price': number;
}

async function seedDatabase() {
  try {
    // Connect to database
    await database.connect();
    
    // Clear existing data
    console.log('Clearing existing data...');
    
    // Drop collections to avoid schema conflicts
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('products')) {
        await db.dropCollection('products');
        console.log('Dropped products collection');
      }
      if (collectionNames.includes('categories')) {
        await db.dropCollection('categories');
        console.log('Dropped categories collection');
      }
      if (collectionNames.includes('variants')) {
        await db.dropCollection('variants');
        console.log('Dropped variants collection');
      }
    }
    
    // Read Excel file
    const excelPath = path.join(process.cwd(), 'src', 'data', 'product.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets['converted_product_format_sorted'];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
    
    // Remove header row and convert to objects
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1) as unknown[][];
    
    const excelData: ExcelRow[] = dataRows.map(row => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        obj[header] = (row as unknown[])[index] || '';
      });
      return obj as unknown as ExcelRow;
    });
    
    console.log(`Found ${excelData.length} products to process`);
    
    // Create categories
    const categoryNames = [...new Set(excelData.map(row => row.category.trim()).filter(Boolean))];
    const categoryMap = new Map<string, string>();
    
    console.log('Creating categories...');
    for (const categoryName of categoryNames) {
      try {
        // Use upsert to avoid duplicate key errors
        const category = await Category.findOneAndUpdate(
          { name: categoryName },
          {
            name: categoryName,
            description: `${categoryName} trading challenges and evaluations`,
            image: '/images/category-placeholder.jpg',
            isActive: true,
            products: []
          },
          { upsert: true, new: true }
        );
        
        categoryMap.set(categoryName, (category._id as mongoose.Types.ObjectId).toString());
        console.log(`Created/Updated category: ${categoryName}`);
      } catch (error) {
        console.error(`Error creating category ${categoryName}:`, error);
      }
    }
    
    // Create products and variants
    console.log('Creating products and variants...');
    for (const row of excelData) {
      if (!row.name || !row.category) {
        console.log('Skipping row with missing name or category');
        continue;
      }
      
      const categoryId = categoryMap.get(row.category.trim());
      if (!categoryId) {
        console.log(`Category not found for product: ${row.name}`);
        continue;
      }
      
      // Create product
      const product = new Product({
        name: row.name.trim(),
        description: row.description || '',
        images: row.image ? [row.image] : ['/images/product-placeholder.jpg'],
        category: new mongoose.Types.ObjectId(categoryId),
        variants: [],
        tags: row.tags ? [row.tags.trim()] : [],
        isActive: true,
        isFeatured: false,
        seoDescription: `${row.name} - Trading challenge and evaluation`,
        seoKeywords: row.tags ? [row.tags.trim(), row.category.trim()] : [row.category.trim()]
      });
      
      const savedProduct = await product.save();
      console.log(`Created product: ${row.name}`);
      
      // Create variants
      const variantIds: string[] = [];
      
      // Variant 1
      if (row['varient 1 name'] && row['varient 1 price']) {
        const variant1 = new Variant({
          name: row['varient 1 name'].toString().trim(),
          comparePrice: Number(row['varient 1 price']),
          costPrice: Number(row['varient 1 price']) * 0.8, // Assuming 20% margin
          isActive: true,
          product: savedProduct._id
        });
        
        const savedVariant1 = await variant1.save();
        variantIds.push((savedVariant1._id as mongoose.Types.ObjectId).toString());
        console.log(`  Created variant: ${row['varient 1 name']} - $${row['varient 1 price']}`);
      }
      
      // Variant 2
      if (row['varient 2 name'] && row['varient 2 price']) {
        const variant2 = new Variant({
          name: row['varient 2 name'].toString().trim(),
          comparePrice: Number(row['varient 2 price']),
          costPrice: Number(row['varient 2 price']) * 0.8, // Assuming 20% margin
          isActive: true,
          product: savedProduct._id
        });
        
        const savedVariant2 = await variant2.save();
        variantIds.push((savedVariant2._id as mongoose.Types.ObjectId).toString());
        console.log(`  Created variant: ${row['varient 2 name']} - $${row['varient 2 price']}`);
      }
      
      // Update product with variant IDs
      if (variantIds.length > 0) {
        await Product.findByIdAndUpdate(savedProduct._id, {
          variants: variantIds.map(id => new mongoose.Types.ObjectId(id))
        });
      }
      
      // Update category with product ID
      await Category.findByIdAndUpdate(categoryId, {
        $push: { products: savedProduct._id }
      });
    }
    
    // Print summary
    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalVariants = await Variant.countDocuments();
    
    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Categories created: ${totalCategories}`);
    console.log(`Products created: ${totalProducts}`);
    console.log(`Variants created: ${totalVariants}`);
    
    // List all categories
    const categories = await Category.find({}, 'name products').populate('products', 'name');
    console.log('\nCategories and their products:');
    categories.forEach(category => {
      const productCount = Array.isArray(category.products) ? category.products.length : 0;
      console.log(`- ${category.name} (${productCount} products)`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run the seeding script
seedDatabase(); 