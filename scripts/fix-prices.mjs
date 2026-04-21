#!/usr/bin/env node
// One-time script to fix truncated prices in products.json
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = join(__dirname, "../data/products.json");

// Correct prices keyed by product id
const PRICE_FIXES = {
  "heating-pad-sunbeam":          "$29.99",
  "neck-massager-naipo":          "$39.99",
  "himalayan-salt-lamp":          "$25.99",
  "reading-light-glocusent":      "$21.99",
  "foot-spa-kendal":              "$49.99",
  "logitech-webcam-c920":         "$69.99",
  "keyboard-keychron-k2":         "$89.99",
  "desk-mat-mroco":               "$13.99",
  "amazon-smart-plug":            "$24.99",
  "jump-rope-crossrope":          "$19.95",
  "ab-roller-perfect":            "$29.99",
  "workout-gloves-trideer":       "$19.99",
  "blender-bottle-classic":       "$11.99",
  "meal-prep-containers-glass":   "$34.99",
  "cold-brew-maker-oxo":          "$34.95",
  "silicone-baking-mat":          "$11.99",
  "mortar-pestle-chefsofi":       "$34.95",
  "coffee-grinder-baratza":       "$179.00",
  "foreo-luna-mini":              "$79.00",
  "scalp-massager-heeta":         "$9.99",
  "burts-bees-lip-set":           "$9.98",
  "loccitane-hand-cream":         "$30.50",
  "gua-sha-tool":                 "$32.00",
  "ferrero-rocher-48":            "$24.99",
  "spindrift-sparkling-water":    "$21.99",
  "clif-bar-variety":             "$27.99",
  "dark-chocolate-endangered":    "$33.99",
  "trail-mix-planters":           "$10.49",
  "skinny-pop-popcorn":           "$15.99",
  "string-lights-brightown":      "$21.99",
  "desk-organizer-simple":        "$23.99",
  "succulent-set-costa":          "$19.98",
  "throw-pillow-boho":            "$18.99",
  "sunset-lamp-projection":       "$22.99",
  "govee-led-strip":              "$19.99",
  "tile-mate-tracker":            "$59.99",
  "acupressure-mat-dosmart":      "$29.99",
  "mini-fridge-chefman":          "$39.99",
};

const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf8"));
let fixed = 0;

for (const product of products) {
  if (PRICE_FIXES[product.id]) {
    const old = product.price;
    product.price = PRICE_FIXES[product.id];
    console.log(`✓ ${product.id}: "${old}" → "${product.price}"`);
    fixed++;
  }
}

writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
console.log(`\nFixed ${fixed} prices.`);
