import express from "express"
import helmet from "helmet"
import cors from "cors"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: [],
}

app.use(helmet({ contentSecurityPolicy: { directives: cspDirectives } }))
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
app.use(express.json({ limit: "1mb" }))

app.use(
  express.static(join(__dirname, "..", "dist"), {
    maxAge: "1y",
    immutable: true,
  })
)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "..", "dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
