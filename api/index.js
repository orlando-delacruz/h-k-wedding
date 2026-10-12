// Vercel serverless entry point.
// Every /api/* request is routed here by vercel.json and handled by the same
// Express app used in local development.
import dotenv from 'dotenv'
dotenv.config()

const { default: app } = await import('../server/app.js')

export default app
