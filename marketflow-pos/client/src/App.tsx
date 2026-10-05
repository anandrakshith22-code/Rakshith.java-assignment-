import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown, ArrowRight, Barcode, Bell, Check, ChevronDown, CircleHelp, Clock3,
  CreditCard, Grid2X2, Headphones, Minus, Package, Plus, Search, ShieldCheck,
  ShoppingBasket, Tag, Trash2, Wallet, X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { checkout, getProductByBarcode, searchProducts } from "./lib/api";
import { Receipt } from "./components/Receipt";
import type { Bill, CartItem, Product } from "./types";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

const getDailyRandomValue = (date: Date, min: number, max: number, salt: number) => {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = startOfDay.getTime() / 86400000;
  const wave = Math.abs(Math.sin((dayNumber + salt) * 12.9898)) * 10000;
  return min + (wave % (max - min));
};

type PaymentMethod = "CASH" | "CARD" | "UPI";
const upiId = "7892386992@ybl";
const categories = ["All items", "Dairy", "Bakery", "Pantry", "Snacks", "Beverages", "Household"];
const demoProducts: Product[] = [
  { id: "demo-milk", barcode: "8901030865432", name: "Everyday Milk 1L", category: "Dairy", hsnCode: "0401", price: "62.00", gstRate: "5.00", discountRate: "0.00", stock: 38 },
  { id: "demo-bread", barcode: "8901725184217", name: "Whole Wheat Bread", category: "Bakery", hsnCode: "1905", price: "45.00", gstRate: "5.00", discountRate: "0.00", stock: 24 },
  { id: "demo-rice", barcode: "8901058855120", name: "Basmati Rice 1kg", category: "Pantry", hsnCode: "1006", price: "129.00", gstRate: "5.00", discountRate: "0.00", stock: 42 },
  { id: "demo-chips", barcode: "8901491101127", name: "Masala Chips", category: "Snacks", hsnCode: "2005", price: "30.00", gstRate: "12.00", discountRate: "0.00", stock: 65 },
  { id: "demo-juice", barcode: "8901030899902", name: "Orange Juice 1L", category: "Beverages", hsnCode: "2009", price: "110.00", gstRate: "12.00", discountRate: "0.00", stock: 19 },
  { id: "demo-dish", barcode: "8901234567890", name: "Dish Wash Liquid", category: "Household", hsnCode: "3402", price: "95.00", gstRate: "18.00", discountRate: "0.00", stock: 12 },
  { id: "demo-paneer", barcode: "8902345678901", name: "Fresh Paneer 200g", category: "Dairy", hsnCode: "0406", price: "120.00", gstRate: "5.00", discountRate: "0.00", stock: 18 },
  { id: "demo-cookies", barcode: "8902345678902", name: "Chocolate Cookies", category: "Bakery", hsnCode: "1905", price: "68.00", gstRate: "5.00", discountRate: "0.00", stock: 27 },
  { id: "demo-turmeric", barcode: "8902345678903", name: "Turmeric Powder 500g", category: "Pantry", hsnCode: "0910", price: "89.00", gstRate: "5.00", discountRate: "0.00", stock: 21 },
  { id: "demo-peanuts", barcode: "8902345678904", name: "Roasted Peanuts 200g", category: "Snacks", hsnCode: "2008", price: "55.00", gstRate: "12.00", discountRate: "0.00", stock: 48 },
  { id: "demo-coconut", barcode: "8902345678905", name: "Coconut Water 1L", category: "Beverages", hsnCode: "2009", price: "75.00", gstRate: "12.00", discountRate: "0.00", stock: 31 },
  { id: "demo-cleaner", barcode: "8902345678906", name: "Floor Cleaner 500ml", category: "Household", hsnCode: "3405", price: "145.00", gstRate: "18.00", discountRate: "0.00", stock: 16 },
  { id: "demo-cheese", barcode: "8902345678907", name: "Cheese Slices 200g", category: "Dairy", hsnCode: "0406", price: "180.00", gstRate: "5.00", discountRate: "0.00", stock: 20 },
  { id: "demo-yogurt", barcode: "8902345678908", name: "Yogurt Cups 400g", category: "Dairy", hsnCode: "0403", price: "90.00", gstRate: "5.00", discountRate: "0.00", stock: 26 },
  { id: "demo-butter-cookies", barcode: "8902345678909", name: "Butter Cookies 250g", category: "Bakery", hsnCode: "1905", price: "76.00", gstRate: "5.00", discountRate: "0.00", stock: 24 },
  { id: "demo-saffron-rice", barcode: "8902345678910", name: "Saffron Rice 1kg", category: "Pantry", hsnCode: "1006", price: "210.00", gstRate: "5.00", discountRate: "0.00", stock: 14 },
  { id: "demo-oats", barcode: "8902345678911", name: "Oats 500g", category: "Pantry", hsnCode: "1103", price: "96.00", gstRate: "5.00", discountRate: "0.00", stock: 29 },
  { id: "demo-pickle", barcode: "8902345678912", name: "Mango Pickle 300g", category: "Pantry", hsnCode: "2001", price: "82.00", gstRate: "5.00", discountRate: "0.00", stock: 18 },
  { id: "demo-trail-mix", barcode: "8902345678913", name: "Trail Mix 250g", category: "Snacks", hsnCode: "2008", price: "145.00", gstRate: "12.00", discountRate: "0.00", stock: 17 },
  { id: "demo-lemon-soda", barcode: "8902345678914", name: "Lemon Soda 600ml", category: "Beverages", hsnCode: "2202", price: "58.00", gstRate: "12.00", discountRate: "0.00", stock: 44 },
  { id: "demo-herbal-tea", barcode: "8902345678915", name: "Herbal Tea 20s", category: "Beverages", hsnCode: "2202", price: "120.00", gstRate: "12.00", discountRate: "0.00", stock: 21 },
  { id: "demo-detergent", barcode: "8902345678916", name: "Detergent Powder 1kg", category: "Household", hsnCode: "3402", price: "170.00", gstRate: "18.00", discountRate: "0.00", stock: 13 },
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [receipt, setReceipt] = useState<Bill | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const today = useMemo(() => new Date(), []);
  const summaryDateLabel = useMemo(
    () => new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(today),
    [today],
  );
  const dailySales = useMemo(() => Math.round(getDailyRandomValue(today, 19500, 35200, 1.75)), [today]);
  const dailyTransactions = useMemo(() => Math.round(getDailyRandomValue(today, 62, 118, 2.4)), [today]);
  const avgBasketValue = useMemo(() => Math.round(getDailyRandomValue(today, 210, 340, 3.8)), [today]);
  const salesTrend = useMemo(() => `${(getDailyRandomValue(today, 7.2, 18.6, 4.6)).toFixed(1)}%`, [today]);
  const transactionTrend = useMemo(() => `${(getDailyRandomValue(today, 5.7, 14.9, 5.8)).toFixed(1)}%`, [today]);
  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef("");
  const barcodeSequenceStart = useRef(0);
  const barcodeLastKeyAt = useRef(0);
  const barcodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    searchProducts("").then((result) => {
      if (active) {
        setApiStatus("online");
        setProducts(result);
      }
    }).catch(() => {
      if (active) setApiStatus("offline");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => {
      searchProducts(search)
        .then((result) => { setApiStatus("online"); setProducts(result); })
        .catch(() => { setApiStatus("offline"); setProducts(demoProducts); });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, searchOpen]);

  const addProduct = useCallback((product: Product) => {
    if (product.stock < 1) {
      setNotice(`${product.name} is out of stock.`);
      return;
    }
    setCart((items) => {
      const current = items.find((item) => item.id === product.id);
      if (current && current.quantity >= product.stock) {
        setNotice(`Only ${product.stock} ${product.name} available.`);
        return items;
      }
      setNotice("");
      return current
        ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }];
    });
  }, []);

  const scanBarcode = useCallback(async (barcode: string) => {
    try {
      const product = await getProductByBarcode(barcode);
      addProduct(product);
    } catch (error) {
      const cached = products.find((item) => item.barcode === barcode);
      if (cached) addProduct(cached);
      else setNotice(error instanceof Error ? error.message : "Product barcode was not found.");
    }
  }, [addProduct, products]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
        return;
      }
      if (event.key === "F2") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
        return;
      }
      if (event.key === "F4" && cart.length) {
        event.preventDefault();
        setPaymentOpen(true);
        return;
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setPaymentOpen(false);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Enter") {
        const barcode = barcodeBuffer.current;
        const isScannerInput = barcode.length >= 6 && event.timeStamp - barcodeSequenceStart.current <= 700;
        barcodeBuffer.current = "";
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        if (isScannerInput) {
          event.preventDefault();
          event.stopPropagation();
          if (searchOpen) setSearch("");
          void scanBarcode(barcode);
        }
        return;
      }
      if (event.key.length === 1) {
        if (!barcodeBuffer.current || event.timeStamp - barcodeLastKeyAt.current > 55) {
          barcodeBuffer.current = "";
          barcodeSequenceStart.current = event.timeStamp;
        }
        barcodeBuffer.current += event.key;
        barcodeLastKeyAt.current = event.timeStamp;
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => { barcodeBuffer.current = ""; }, 250);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cart.length, scanBarcode, searchOpen]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let itemDiscount = 0;
    let cgst = 0;
    let sgst = 0;
    const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
    for (const item of cart) {
      const gross = Number(item.price) * item.quantity;
      const discount = rounded(gross * Number(item.discountRate) / 100);
      const taxable = rounded(gross - discount);
      const tax = rounded(taxable * Number(item.gstRate) / 100);
      const halfTax = rounded(tax / 2);
      subtotal += rounded(gross);
      itemDiscount += discount;
      cgst += halfTax;
      sgst += halfTax;
    }
    const eligibleSubtotal = Math.max(subtotal - itemDiscount, 0);
    const couponDiscount = couponApplied ? Math.min(eligibleSubtotal * 0.1, 500) : 0;
    return {
      subtotal: rounded(subtotal),
      itemDiscount: rounded(itemDiscount),
      cgst: rounded(cgst),
      sgst: rounded(sgst),
      couponDiscount: rounded(couponDiscount),
      total: rounded(subtotal - itemDiscount - couponDiscount + cgst + sgst),
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, couponApplied]);

  function updateQuantity(productId: string, delta: number) {
    setCart((items) => items.flatMap((item) => {
      if (item.id !== productId) return [item];
      const quantity = item.quantity + delta;
      if (quantity < 1) return [];
      if (quantity > item.stock) {
        setNotice(`Only ${item.stock} ${item.name} available.`);
        return [item];
      }
      return [{ ...item, quantity }];
    }));
  }

  async function completeCheckout() {
    if (!cart.length || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const bill = await checkout({
        items: cart.map(({ id, quantity }) => ({ productId: id, quantity })),
        paymentMethod,
        ...(couponApplied ? { couponCode: "SAVE10" } : {}),
      });
      setReceipt(bill);
      setCart([]);
      setCoupon("");
      setCouponApplied(false);
      setPaymentOpen(false);
      setProducts((current) => current.map((product) => {
        const sold = bill.items.find((item) => item.barcode === product.barcode)?.quantity || 0;
        return { ...product, stock: Math.max(product.stock - sold, 0) };
      }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Checkout failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    (category === "All items" || product.category === category)
    && (!search || `${product.name} ${product.barcode}`.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col items-center border-r border-line bg-white py-6 lg:flex">
        <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-forest text-white"><ShoppingBasket size={21} /></div>
        <nav className="flex flex-1 flex-col gap-3">
          <NavIcon active icon={<Grid2X2 size={19} />} label="Point of sale" />
          <NavIcon icon={<Package size={19} />} label="Inventory" />
          <NavIcon icon={<Clock3 size={19} />} label="Transactions" />
          <NavIcon icon={<Tag size={19} />} label="Promotions" />
        </nav>
        <button title="Help" className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-canvas"><CircleHelp size={19} /></button>
        <div className="mt-5 grid h-9 w-9 place-items-center rounded-full bg-[#f4d8c4] text-xs font-bold text-[#77533a]">R</div>
      </aside>

      <main className="min-h-screen lg:ml-[76px]">
        <header className="flex h-[74px] items-center justify-between border-b border-line bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-white lg:hidden"><ShoppingBasket size={19} /></div>
            <div><p className="text-[15px] font-bold">Point of sale</p><p className="text-xs text-muted">Store 01 <span className="mx-1.5">·</span> Main branch</p></div>
          </div>
          <div className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex ${apiStatus === "online" ? "bg-mint text-forest" : apiStatus === "offline" ? "bg-amber-50 text-amber-700" : "bg-canvas text-muted"}`}><span className={`h-2 w-2 rounded-full ${apiStatus === "online" ? "bg-forest" : apiStatus === "offline" ? "bg-amber-500" : "bg-muted"}`} />{apiStatus === "online" ? "Register online" : apiStatus === "offline" ? "Demo catalogue" : "Connecting..."}</div>
          <div className="flex items-center gap-3">
            <button title="Notifications" className="relative grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-canvas"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-400" /></button>
            <div className="hidden border-l border-line pl-3 sm:block"><p className="text-xs font-semibold">Rakshith</p><p className="text-[11px] text-muted">Cashier · Shift 09:00–17:00</p></div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4d8c4] text-xs font-bold text-[#77533a]">R</div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_410px] xl:gap-7 xl:p-8">
          <section className="min-w-0">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted"><span>Store</span><ArrowRight size={13} /><span className="text-ink">New sale</span></div><h1 className="text-[26px] font-bold tracking-tight">Good morning, Rakshith <span className="text-xl">☀️</span></h1><p className="mt-1 text-sm text-muted">Let's make checkout a breeze.</p></div>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs text-muted"><Clock3 size={14} /><span>{summaryDateLabel}</span><ChevronDown size={14} /></div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Today's sales" value={money(dailySales)} change={`+${salesTrend}`} tone="green" />
              <StatCard label="Transactions" value={String(dailyTransactions)} change={`+${transactionTrend}`} tone="green" />
              <div className="col-span-2 rounded-2xl border border-line bg-white p-4 shadow-card sm:col-span-1"><p className="text-xs text-muted">Avg. basket</p><div className="mt-2 flex items-end justify-between"><p className="text-xl font-bold">{money(avgBasketValue)}</p><span className="text-[11px] text-muted">Today</span></div></div>
            </div>

            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Quick add</h2><p className="mt-0.5 text-xs text-muted">Tap a product or scan its barcode</p></div><button onClick={() => setSearchOpen(true)} className="text-xs font-semibold text-forest hover:underline">View all products <ArrowRight size={13} className="ml-1 inline" /></button></div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-ink text-white" : "border border-line bg-white text-muted hover:border-forest/30 hover:text-forest"}`}>{item}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.slice(0, 8).map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={() => addProduct(product)} />)}
              {filteredProducts.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No products match this category.</div>}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-xs text-muted shadow-card">
              <div className="flex items-center gap-2"><Barcode size={16} className="text-forest" /><span><strong className="text-ink">Barcode scanner ready</strong> · Scan an item to add it instantly</span></div>
              <div className="flex gap-2"><KeyHint>F2</KeyHint><span>Search</span><KeyHint>F4</KeyHint><span>Pay</span></div>
            </div>
          </section>

          <section className="h-fit overflow-hidden rounded-2xl border border-line bg-white shadow-card xl:sticky xl:top-6">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div><h2 className="font-bold">Current sale</h2><p className="mt-0.5 text-xs text-muted">Walk-in customer</p></div>
              <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-canvas">Add customer +</button>
            </div>
            <div className="flex items-center justify-between px-5 py-3 text-xs text-muted"><span>{totals.count} items</span><button onClick={() => setCart([])} disabled={!cart.length} className="font-medium text-muted hover:text-red-500 disabled:opacity-40"><Trash2 size={13} className="mr-1 inline" />Clear</button></div>

            {notice && <div role="alert" className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700"><ShieldCheck size={15} className="mt-0.5 shrink-0" />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss" className="ml-auto"><X size={14} /></button></div>}
            <div className="max-h-[320px] min-h-[190px] overflow-y-auto px-4">
              {cart.length ? cart.map((item) => <CartRow key={item.id} item={item} onChange={(delta) => updateQuantity(item.id, delta)} onRemove={() => setCart((items) => items.filter((current) => current.id !== item.id))} />) : (
                <div className="flex h-[190px] flex-col items-center justify-center text-center"><div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted"><ShoppingBasket size={22} /></div><p className="text-sm font-semibold">Your cart is empty</p><p className="mt-1 text-xs text-muted">Scan a barcode or add a product to begin</p></div>
              )}
            </div>

            <div className="mx-5 border-t border-dashed border-line" />
            <div className="space-y-3 px-5 py-4 text-[13px]">
              <SummaryLine label="Subtotal" value={money(totals.subtotal)} />
              <SummaryLine label="Item discounts" value={`− ${money(totals.itemDiscount)}`} muted />
              <SummaryLine label="CGST" value={money(totals.cgst)} muted />
              <SummaryLine label="SGST" value={money(totals.sgst)} muted />
              {couponApplied && <SummaryLine label="Coupon · SAVE10" value={`− ${money(totals.couponDiscount)}`} muted />}
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1"><Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={coupon} onChange={(event) => { setCoupon(event.target.value.toUpperCase()); setCouponApplied(false); }} placeholder="Coupon code" className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-xs outline-none placeholder:text-muted focus:border-forest" /></div>
                <button onClick={() => { if (coupon.trim() === "SAVE10") { setCouponApplied(true); setNotice(""); } else if (coupon.trim()) setNotice("Coupon code is not valid."); }} className="rounded-xl border border-line px-3 text-xs font-semibold hover:bg-canvas">{couponApplied ? <Check size={16} className="text-forest" /> : "Apply"}</button>
              </div>
            </div>
            <div className="bg-[#f8faf8] px-5 py-4">
              <div className="mb-4 flex items-end justify-between"><span className="text-sm font-semibold">Amount due</span><span className="text-[25px] font-bold tracking-tight">{money(totals.total)}</span></div>
              <button disabled={!cart.length || apiStatus !== "online"} onClick={() => setPaymentOpen(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-semibold text-white shadow-sm transition hover:bg-[#11583d] disabled:cursor-not-allowed disabled:opacity-40"><Wallet size={17} /> Proceed to payment <ArrowRight size={16} /></button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted"><ShieldCheck size={13} className="text-forest" />{apiStatus === "offline" ? "Demo catalogue · connect the API to enable checkout" : "Secure checkout · Tax calculated by HSN"}</div>
            </div>
          </section>
        </div>
        <footer className="mx-auto flex max-w-[1600px] items-center justify-between px-5 pb-5 text-[11px] text-muted lg:px-8"><span>MarketFlow POS <span className="mx-1">·</span> v1.0.0</span><span className="flex items-center gap-1.5"><Headphones size={13} /> Need help? Contact support</span></footer>
      </main>

      {searchOpen && <div className="fixed inset-0 z-40 flex items-start justify-center bg-ink/35 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-pop">
          <div className="flex items-center gap-3 border-b border-line px-5"><Search size={18} className="text-muted" /><input ref={searchRef} autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or scan barcode..." className="h-14 flex-1 text-sm outline-none" /><button onClick={() => setSearchOpen(false)} className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted">ESC</button></div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {filteredProducts.map((product) => <button key={product.id} onClick={() => { addProduct(product); setSearchOpen(false); setSearch(""); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-canvas"><div><p className="text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-muted">{product.category} · HSN {product.hsnCode} · {product.stock} in stock</p></div><span className="text-sm font-bold">{money(Number(product.price))}</span></button>)}
            {filteredProducts.length === 0 && <p className="p-8 text-center text-sm text-muted">No products found.</p>}
          </div>
          <div className="flex justify-between border-t border-line px-5 py-3 text-[11px] text-muted"><span>↑↓ to navigate <span className="mx-2">·</span> Enter to add</span><span>Search catalogue</span></div>
        </div>
      </div>}

      {paymentOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-pop">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-lg font-bold">Complete payment</p><p className="mt-1 text-sm text-muted">Choose how the customer would like to pay.</p></div><button onClick={() => setPaymentOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-canvas"><X size={17} /></button></div>
          <div className="mb-5 rounded-2xl bg-canvas px-4 py-3"><p className="text-xs text-muted">Amount to collect</p><p className="mt-1 text-2xl font-bold">{money(totals.total)}</p></div>
          <div className="mb-5 grid grid-cols-3 gap-2">{([
            ["CASH", "Cash", <Wallet size={17} />],
            ["CARD", "Card", <CreditCard size={17} />],
            ["UPI", "UPI QR", <Barcode size={17} />],
          ] as const).map(([method, label, icon]) => <button key={method} onClick={() => setPaymentMethod(method)} className={`flex flex-col items-center gap-2 rounded-xl border py-3 text-xs font-semibold ${paymentMethod === method ? "border-forest bg-mint text-forest" : "border-line text-muted hover:bg-canvas"}`}>{icon}{label}</button>)}</div>
          {paymentMethod === "UPI" && <div className="mb-5 flex items-center gap-4 rounded-2xl border border-line p-4"><QRCodeSVG value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=GreenMart&am=${totals.total.toFixed(2)}&cu=INR`} size={86} level="M" /><div><p className="text-sm font-semibold">Scan to pay</p><p className="mt-1 text-xs leading-relaxed text-muted">Customer scans this QR with any UPI app.</p><p className="mt-2 text-xs font-semibold text-forest">{money(totals.total)}</p></div></div>}
          <button disabled={busy || !cart.length} onClick={() => void completeCheckout()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-semibold text-white hover:bg-[#11583d] disabled:opacity-50">{busy ? "Processing..." : <>Confirm {paymentMethod.toLowerCase()} payment <ArrowRight size={16} /></>}</button>
          <p className="mt-3 text-center text-[10px] text-muted">Stock is verified and deducted when the bill is confirmed.</p>
        </div>
      </div>}
      {receipt && <Receipt bill={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function NavIcon({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return <button title={label} className={`grid h-10 w-10 place-items-center rounded-xl transition ${active ? "bg-mint text-forest" : "text-muted hover:bg-canvas"}`}>{icon}</button>;
}

function StatCard({ label, value, change, tone }: { label: string; value: string; change: string; tone: "green" | "orange" }) {
  return <div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-xs text-muted">{label}</p><div className="mt-2 flex items-end justify-between"><p className="text-xl font-bold">{value}</p><span className={`flex items-center gap-0.5 text-[10px] font-semibold ${tone === "green" ? "text-forest" : "text-orange-600"}`}>{tone === "green" ? <ArrowDown size={11} className="rotate-[-135deg]" /> : null}{change}</span></div></div>
}

function ProductCard({ product, index, onAdd }: { product: Product; index: number; onAdd: () => void }) {
  const colors = ["bg-[#eaf3e9]", "bg-[#f4eae0]", "bg-[#f2e8ef]", "bg-[#e8eef4]", "bg-[#f6f0dd]", "bg-[#e3efee]"];
  const icons = [<span>🥛</span>, <span>🍞</span>, <span>🍚</span>, <span>🥔</span>, <span>🧃</span>, <span>🧴</span>];
  return <button onClick={onAdd} disabled={product.stock < 1} className="group relative overflow-hidden rounded-2xl border border-line bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md disabled:opacity-50">
    <div className={`mb-3 flex h-[94px] items-center justify-center rounded-xl ${colors[index % colors.length]} text-4xl`}>{icons[index % icons.length]}</div>
    <p className="truncate text-[13px] font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-muted">{product.category} <span className="mx-1">·</span> {product.stock} in stock</p>
    <div className="mt-3 flex items-center justify-between"><span className="text-sm font-bold">{money(Number(product.price))}</span><span className="grid h-7 w-7 place-items-center rounded-lg bg-mint text-forest transition group-hover:bg-forest group-hover:text-white"><Plus size={16} /></span></div>
  </button>;
}

function CartRow({ item, onChange, onRemove }: { item: CartItem; onChange: (delta: number) => void; onRemove: () => void }) {
  const lineTotal = Number(item.price) * item.quantity * (1 - Number(item.discountRate) / 100) * (1 + Number(item.gstRate) / 100);
  return <div className="flex gap-3 border-b border-line py-3.5 last:border-0">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canvas text-xl">🛍️</div>
    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-xs font-semibold">{item.name}</p><p className="mt-1 text-[10px] text-muted">HSN {item.hsnCode} · GST {item.gstRate}%</p></div><button onClick={onRemove} aria-label={`Remove ${item.name}`} className="text-muted hover:text-red-500"><X size={14} /></button></div>
      <div className="mt-2 flex items-center justify-between"><div className="flex h-7 items-center rounded-lg border border-line"><button onClick={() => onChange(-1)} aria-label="Decrease quantity" className="grid h-7 w-7 place-items-center text-muted hover:text-ink"><Minus size={12} /></button><span className="w-6 text-center text-[11px] font-semibold">{item.quantity}</span><button onClick={() => onChange(1)} aria-label="Increase quantity" className="grid h-7 w-7 place-items-center text-muted hover:text-ink"><Plus size={12} /></button></div><span className="text-xs font-bold">{money(lineTotal)}</span></div>
    </div>
  </div>;
}

function SummaryLine({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return <div className={`flex justify-between ${muted ? "text-muted" : "text-ink"}`}><span>{label}</span><span className="font-medium">{value}</span></div>;
}

function KeyHint({ children }: { children: ReactNode }) {
  return <kbd className="ml-1 rounded border border-line bg-canvas px-1.5 py-0.5 font-sans text-[10px] text-muted">{children}</kbd>;
}
