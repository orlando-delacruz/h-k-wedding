// Local entry point. Vercel imports server/app.js directly through api/index.js,
// so this file only exists to listen on a port during local development.
import app from './app.js'
import { describeWorkbook } from './workbook.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`RSVP API listening on http://localhost:${PORT}`)
  console.log(`Workbook storage: ${describeWorkbook()}`)
})
