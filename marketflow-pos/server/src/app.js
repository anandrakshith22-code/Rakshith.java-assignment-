const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const productRoutes = require("./modules/products/product.routes");
const billRoutes = require("./modules/bills/bill.routes");
const { ApiError, errorHandler } = require("./lib/errors");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/v1/health", (_req, res) => res.json({ data: { status: "ok" } }));
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/bills", billRoutes);
app.use((_req, _res, next) => next(new ApiError(404, "ROUTE_NOT_FOUND", "This API route does not exist.")));
app.use(errorHandler);

module.exports = app;
