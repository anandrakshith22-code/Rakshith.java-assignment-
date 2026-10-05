const express = require("express");
const { z } = require("zod");
const prisma = require("../../lib/prisma");
const { ApiError } = require("../../lib/errors");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { search = "", limit = "24" } = z.object({
      search: z.string().trim().max(100).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    }).parse(req.query);

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search
          ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { barcode: { contains: search } }] }
          : {}),
      },
      include: { inventory: { select: { quantity: true } } },
      orderBy: { name: "asc" },
      take: limit,
    });

    res.json({
      data: products.map((product) => ({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        hsnCode: product.hsnCode,
        price: product.price.toFixed(2),
        gstRate: product.gstRate.toFixed(2),
        discountRate: product.discountRate.toFixed(2),
        stock: product.inventory?.quantity ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/barcode/:barcode", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.barcode },
      include: { inventory: { select: { quantity: true } } },
    });
    if (!product || !product.isActive) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "No active product matches this barcode.");
    }
    res.json({
      data: {
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        hsnCode: product.hsnCode,
        price: product.price.toFixed(2),
        gstRate: product.gstRate.toFixed(2),
        discountRate: product.discountRate.toFixed(2),
        stock: product.inventory?.quantity ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
