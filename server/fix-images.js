require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function migrateImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    // Find all products
    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
      if (product.images && product.images.length > 0) {
        let modified = false;
        const cleanImages = product.images.filter(img => {
          if (img.includes('/uploads/') || img.includes('localhost') || img.startsWith('file://')) {
            modified = true;
            return false; // Remove this image
          }
          return true; // Keep it
        });

        if (modified) {
          product.images = cleanImages;
          await product.save();
          console.log(`Fixed product ${product._id}: "${product.title}" - Removed invalid image paths.`);
          updatedCount++;
        }
      }
    }

    console.log(`\nMigration complete. Fixed ${updatedCount} products with invalid local images.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateImages();
