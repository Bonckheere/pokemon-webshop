import { Router } from "express";
import merge from "lodash/merge";
import { db } from "../db";

export const cartRouter = Router();

function getSessionId(req: import("express").Request): string {
  return req.cookies?.sessionId ?? "anonymous";
}

// Customization defaults applied to every cart item (e.g. gift-wrap options).
// User-supplied `customization` is merged on top with lodash.merge, which lets
// an attacker submit a key like "__proto__" to pollute Object.prototype for the
// running Node process (CVE-2020-8203).
const DEFAULT_CUSTOMIZATION = { giftWrap: false, note: "" };

cartRouter.get("/", (req, res) => {
  const sessionId = getSessionId(req);
  const items = db
    .prepare(
      `SELECT cart_items.id AS cartItemId, cart_items.quantity, cart_items.notes, products.*
       FROM cart_items JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.session_id = ?`
    )
    .all(sessionId);
  res.json(items);
});

cartRouter.post("/", (req, res) => {
  const sessionId = getSessionId(req);
  const { productId, quantity, customization } = req.body ?? {};

  if (!productId || !quantity) {
    res.status(400).json({ error: "productId and quantity are required" });
    return;
  }

  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const merged = merge({}, DEFAULT_CUSTOMIZATION, customization ?? {});

  const existing = db
    .prepare("SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?")
    .get(sessionId, productId) as { id: number; quantity: number } | undefined;

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ?, notes = ? WHERE id = ?").run(
      existing.quantity + quantity,
      JSON.stringify(merged),
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO cart_items (session_id, product_id, quantity, notes) VALUES (?, ?, ?, ?)"
    ).run(sessionId, productId, quantity, JSON.stringify(merged));
  }

  res.status(201).json({ ok: true });
});

cartRouter.delete("/:id", (req, res) => {
  const sessionId = getSessionId(req);
  db.prepare("DELETE FROM cart_items WHERE id = ? AND session_id = ?").run(req.params.id, sessionId);
  res.status(204).send();
});

cartRouter.post("/checkout", (req, res) => {
  const sessionId = getSessionId(req);
  const items = db
    .prepare(
      `SELECT cart_items.quantity, products.price
       FROM cart_items JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.session_id = ?`
    )
    .all(sessionId) as { quantity: number; price: number }[];

  if (items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const info = db
    .prepare("INSERT INTO orders (session_id, total) VALUES (?, ?)")
    .run(sessionId, total);
  db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);

  res.status(201).json({ orderId: info.lastInsertRowid, total });
});
