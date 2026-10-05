require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const products = [
  { barcode: "8901030865432", name: "Everyday Milk 1L", category: "Dairy", hsnCode: "0401", price: "62.00", gstRate: "5.00", quantity: 38 },
  { barcode: "8901725184217", name: "Whole Wheat Bread", category: "Bakery", hsnCode: "1905", price: "45.00", gstRate: "5.00", quantity: 24 },
  { barcode: "8901058855120", name: "Basmati Rice 1kg", category: "Pantry", hsnCode: "1006", price: "129.00", gstRate: "5.00", quantity: 42 },
  { barcode: "8901491101127", name: "Masala Chips", category: "Snacks", hsnCode: "2005", price: "30.00", gstRate: "12.00", quantity: 65 },
  { barcode: "8901030899902", name: "Orange Juice 1L", category: "Beverages", hsnCode: "2009", price: "110.00", gstRate: "12.00", quantity: 19 },
  { barcode: "8901234567890", name: "Dish Wash Liquid", category: "Household", hsnCode: "3402", price: "95.00", gstRate: "18.00", quantity: 12 },
  { barcode: "8902345678901", name: "Fresh Paneer 200g", category: "Dairy", hsnCode: "0406", price: "120.00", gstRate: "5.00", quantity: 18 },
  { barcode: "8902345678902", name: "Chocolate Cookies", category: "Bakery", hsnCode: "1905", price: "68.00", gstRate: "5.00", quantity: 27 },
  { barcode: "8902345678903", name: "Turmeric Powder 500g", category: "Pantry", hsnCode: "0910", price: "89.00", gstRate: "5.00", quantity: 21 },
  { barcode: "8902345678904", name: "Roasted Peanuts 200g", category: "Snacks", hsnCode: "2008", price: "55.00", gstRate: "12.00", quantity: 48 },
  { barcode: "8902345678905", name: "Coconut Water 1L", category: "Beverages", hsnCode: "2009", price: "75.00", gstRate: "12.00", quantity: 31 },
  { barcode: "8902345678906", name: "Floor Cleaner 500ml", category: "Household", hsnCode: "3405", price: "145.00", gstRate: "18.00", quantity: 16 },
  { barcode: "8902345678907", name: "Cheese Slices 200g", category: "Dairy", hsnCode: "0406", price: "180.00", gstRate: "5.00", quantity: 20 },
  { barcode: "8902345678908", name: "Yogurt Cups 400g", category: "Dairy", hsnCode: "0403", price: "90.00", gstRate: "5.00", quantity: 26 },
  { barcode: "8902345678909", name: "Butter Cookies 250g", category: "Bakery", hsnCode: "1905", price: "76.00", gstRate: "5.00", quantity: 24 },
  { barcode: "8902345678910", name: "Saffron Rice 1kg", category: "Pantry", hsnCode: "1006", price: "210.00", gstRate: "5.00", quantity: 14 },
  { barcode: "8902345678911", name: "Oats 500g", category: "Pantry", hsnCode: "1103", price: "96.00", gstRate: "5.00", quantity: 29 },
  { barcode: "8902345678912", name: "Mango Pickle 300g", category: "Pantry", hsnCode: "2001", price: "82.00", gstRate: "5.00", quantity: 18 },
  { barcode: "8902345678913", name: "Trail Mix 250g", category: "Snacks", hsnCode: "2008", price: "145.00", gstRate: "12.00", quantity: 17 },
  { barcode: "8902345678914", name: "Lemon Soda 600ml", category: "Beverages", hsnCode: "2202", price: "58.00", gstRate: "12.00", quantity: 44 },
  { barcode: "8902345678915", name: "Herbal Tea 20s", category: "Beverages", hsnCode: "2202", price: "120.00", gstRate: "12.00", quantity: 21 },
  { barcode: "8902345678916", name: "Detergent Powder 1kg", category: "Household", hsnCode: "3402", price: "170.00", gstRate: "18.00", quantity: 13 },
];

async function main() {
  for (const { quantity, ...product } of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: {
        ...product,
        inventory: { create: { quantity } },
      },
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
