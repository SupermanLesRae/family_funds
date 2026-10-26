import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// LOCAL DEV ONLY: serves/saves the local-mode database as a JSON file (gitignored). Never part of the build.
const DB_URL = "/__local-db";
const DB_FILE = resolve("local-data/db.json");

function localDbFile() {
  return {
    name: "fintrack-local-db-file",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(DB_URL, (req, res) => {
        if (req.method === "GET") {
          try {
            res.setHeader("Content-Type", "application/json");
            res.end(readFileSync(DB_FILE));
          } catch {
            res.statusCode = 404;
            res.end();
          }
          return;
        }
        if (req.method === "PUT") {
          const chunks = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString();
              JSON.parse(body); // reject malformed payloads
              mkdirSync(dirname(DB_FILE), { recursive: true });
              writeFileSync(DB_FILE, JSON.stringify(JSON.parse(body), null, 2));
              res.statusCode = 204;
            } catch {
              res.statusCode = 400;
            }
            res.end();
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localDbFile()],
});
