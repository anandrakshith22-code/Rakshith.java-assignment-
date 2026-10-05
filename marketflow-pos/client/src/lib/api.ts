import type { Bill, Product } from "../types";

type ApiEnvelope<T> = { data: T };
type ApiFailure = { error?: { message?: string; code?: string } };

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Unable to reach the billing service. Check your connection and try again.");
  }

  const payload = (await response.json().catch(() => null)) as ApiFailure | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || "The request could not be completed.");
  }
  return payload as T;
}

export async function searchProducts(search: string): Promise<Product[]> {
  const result = await request<ApiEnvelope<Product[]>>(`/api/v1/products?search=${encodeURIComponent(search)}&limit=30`);
  return result.data;
}

export async function getProductByBarcode(barcode: string): Promise<Product> {
  const result = await request<ApiEnvelope<Product>>(`/api/v1/products/barcode/${encodeURIComponent(barcode)}`);
  return result.data;
}

export async function checkout(input: {
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: "CASH" | "CARD" | "UPI";
  couponCode?: string;
}): Promise<Bill> {
  const result = await request<ApiEnvelope<Bill>>("/api/v1/bills/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}
