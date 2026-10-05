import { Printer } from "lucide-react";
import type { Bill } from "../types";

const currency = (value: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));

export function Receipt({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-7 shadow-pop">
        <div className="no-print mb-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">Payment complete</p>
            <p className="text-sm text-muted">Invoice {bill.invoiceNumber}</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-canvas">
            <Printer size={16} /> Print
          </button>
        </div>
        <div className="receipt mx-auto max-w-[300px] text-[12px] text-ink">
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight">GREENMART</h2>
            <p>Fresh choices, every day</p>
            <p>Tax Invoice · {new Date(bill.createdAt).toLocaleString("en-IN")}</p>
            <p className="font-semibold">{bill.invoiceNumber}</p>
          </div>
          <div className="my-3 border-t border-dashed border-ink/50" />
          <div className="grid grid-cols-[1fr_auto] gap-x-2">
            {bill.items.map((item, index) => (
              <div key={`${item.barcode}-${index}`} className="col-span-2 grid grid-cols-[1fr_auto] py-1">
                <span>{item.productName}<br /><span className="text-[10px]">{item.quantity} × {currency(item.unitPrice)} · HSN {item.hsnCode}</span></span>
                <span>{currency(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="my-3 border-t border-dashed border-ink/50" />
          <div className="space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{currency(bill.subtotal)}</span></div>
            <div className="flex justify-between"><span>Item discounts</span><span>-{currency(bill.itemDiscount)}</span></div>
            {Number(bill.couponDiscount) > 0 && <div className="flex justify-between"><span>Coupon {bill.couponCode}</span><span>-{currency(bill.couponDiscount)}</span></div>}
            <div className="flex justify-between"><span>CGST</span><span>{currency(bill.cgst)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>{currency(bill.sgst)}</span></div>
            <div className="mt-2 flex justify-between border-t border-dashed border-ink/50 pt-2 text-sm font-black"><span>AMOUNT PAID</span><span>{currency(bill.total)}</span></div>
            <div className="flex justify-between"><span>Payment</span><span>{bill.paymentMethod}</span></div>
          </div>
          <div className="my-3 border-t border-dashed border-ink/50" />
          <p className="text-center">Thank you for shopping with us!</p>
          <p className="text-center">Goods once sold cannot be returned.</p>
        </div>
        <button onClick={onClose} className="no-print mt-6 w-full rounded-xl bg-forest py-3 font-semibold text-white hover:bg-forest/90">
          New bill
        </button>
      </div>
    </div>
  );
}
