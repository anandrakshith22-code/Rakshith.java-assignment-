const express = require("express");
const { randomUUID } = require("crypto");
const { Prisma } = require("@prisma/client");
const { z } = require("zod");
const prisma = require("../../lib/prisma");
const { ApiError } = require("../../lib/errors");

const router = express.Router();
const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(1000),
  })).min(1).max(100),
  paymentMethod: z.enum(["CASH", "CARD", "UPI"]),
  customerId: z.string().uuid().nullable().optional(),
  couponCode: z.string().trim().max(32).optional().nullable(),
});

const ZERO = new Prisma.Decimal(0);
const money = (value) => value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

function getCouponDiscount(code, subtotal) {
  if (!code) return { code: null, discount: ZERO };

  if (code.trim().toUpperCase() !== "SAVE10") {
    throw new ApiError(400, "INVALID_COUPON", "This coupon code is not valid.");
  }

  const eligibleSubtotal = subtotal.lessThan(ZERO) ? ZERO : subtotal;

  return {
    code: "SAVE10",
    discount: money(Prisma.Decimal.min(eligibleSubtotal.mul("0.10"), new Prisma.Decimal("500"))),
  };
}

router.post("/checkout", async (req, res, next) => {
  try {
    const input = checkoutSchema.parse(req.body);
    const requested = new Map();
    for (const item of input.items) {
      requested.set(item.productId, (requested.get(item.productId) || 0) + item.quantity);
    }
    const productIds = [...requested.keys()].sort();

    const bill = await prisma.$transaction(async (tx) => {
      if (input.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
        if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "The selected customer does not exist.");
      }

      // Lock inventory rows in stable order so concurrent checkouts cannot oversell or deadlock.
      for (const productId of productIds) {
        await tx.$queryRaw`
          SELECT "productId" FROM "Inventory"
          WHERE "productId" = ${productId}::uuid
          FOR UPDATE
        `;
      }

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { inventory: true },
      });
      const byId = new Map(products.map((product) => [product.id, product]));

      for (const [productId, quantity] of requested) {
        const product = byId.get(productId);
        if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "One or more products are unavailable.", { productId });
        const available = product.inventory?.quantity ?? 0;
        if (available < quantity) {
          throw new ApiError(409, "OUT_OF_STOCK", `${product.name} has only ${available} left in stock.`, {
            productId,
            requested: quantity,
            available,
          });
        }
      }

      const calculatedItems = [];
      let subtotal = ZERO;
      let itemDiscount = ZERO;
      let cgst = ZERO;
      let sgst = ZERO;

      for (const [productId, quantity] of requested) {
        const product = byId.get(productId);
        const gross = product.price.mul(quantity);
        const discount = money(gross.mul(product.discountRate).div(100));
        const taxableValue = money(gross.minus(discount));
        const tax = money(taxableValue.mul(product.gstRate).div(100));
        const halfTax = money(tax.div(2));
        const itemTotal = taxableValue.plus(halfTax).plus(halfTax);

        subtotal = subtotal.plus(gross);
        itemDiscount = itemDiscount.plus(discount);
        cgst = cgst.plus(halfTax);
        sgst = sgst.plus(halfTax);
        calculatedItems.push({
          productId,
          productName: product.name,
          barcode: product.barcode,
          hsnCode: product.hsnCode,
          quantity,
          unitPrice: product.price,
          discountRate: product.discountRate,
          discount,
          gstRate: product.gstRate,
          taxableValue,
          cgst: halfTax,
          sgst: halfTax,
          total: itemTotal,
        });
      }

      subtotal = money(subtotal);
      itemDiscount = money(itemDiscount);
      cgst = money(cgst);
      sgst = money(sgst);
      const coupon = getCouponDiscount(input.couponCode, subtotal.minus(itemDiscount));
      const taxTotal = cgst.plus(sgst);
      const total = money(subtotal.minus(itemDiscount).minus(coupon.discount).plus(taxTotal));
      const invoiceNumber = `INV-${randomUUID().toUpperCase()}`;

      for (const [productId, quantity] of requested) {
        await tx.inventory.update({
          where: { productId },
          data: { quantity: { decrement: quantity } },
        });
      }

      return tx.bill.create({
        data: {
          invoiceNumber,
          customerId: input.customerId || null,
          paymentMethod: input.paymentMethod,
          subtotal,
          itemDiscount,
          couponDiscount: coupon.discount,
          cgst,
          sgst,
          taxTotal,
          total,
          couponCode: coupon.code,
          items: { create: calculatedItems },
        },
        include: { items: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

    res.status(201).json({
      data: {
        ...bill,
        subtotal: bill.subtotal.toFixed(2),
        itemDiscount: bill.itemDiscount.toFixed(2),
        couponDiscount: bill.couponDiscount.toFixed(2),
        cgst: bill.cgst.toFixed(2),
        sgst: bill.sgst.toFixed(2),
        taxTotal: bill.taxTotal.toFixed(2),
        total: bill.total.toFixed(2),
        items: bill.items.map((item) => ({
          ...item,
          unitPrice: item.unitPrice.toFixed(2),
          discountRate: item.discountRate.toFixed(2),
          discount: item.discount.toFixed(2),
          gstRate: item.gstRate.toFixed(2),
          taxableValue: item.taxableValue.toFixed(2),
          cgst: item.cgst.toFixed(2),
          sgst: item.sgst.toFixed(2),
          total: item.total.toFixed(2),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
