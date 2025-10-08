const fs = require('fs');

const inputPath = 'products.json';
const outputPath = 'products_clean.json';

const products = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

products.forEach(product => {
  if (product.actual_price) {
    // Extract numeric part only
    const match = product.actual_price.match(/[\d.]+/);
    if (match) {
      const actual = Math.round(parseFloat(match[0]));

      // Clean actual price (no decimals)
      product.actual_price = actual.toString();

      // Discount percentage (13%)
      const discountPercent = 13;

      // Calculate discount amount (difference)
      const discountAmount = Math.round((actual * discountPercent) / 100);

      // Assign discount amount as price
      product.price = discountAmount.toString();
    }
  }
});

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
console.log('✅ Added discount amount as price. Output:', outputPath);
