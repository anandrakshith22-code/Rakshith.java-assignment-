export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  hsnCode: string;
  price: string;
  gstRate: string;
  discountRate: string;
  stock: number;
};

export type CartItem = Product & { quantity: number };

export type Bill = {
  id: string;
  invoiceNumber: string;
  paymentMethod: "CASH" | "CARD" | "UPI";
  subtotal: string;
  itemDiscount: string;
  couponDiscount: string;
  cgst: string;
  sgst: string;
  taxTotal: string;
  total: string;
  couponCode: string | null;
  createdAt: string;
  items: Array<{
    productName: string;
    barcode: string;
    hsnCode: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
};
