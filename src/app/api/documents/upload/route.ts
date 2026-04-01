// POST /api/documents/upload
// - Auth required (doctor)
// - Accepts multipart form data (file + metadata)
// - Uploads file to Cloudflare R2
// - Saves reference in documents table (linked to patient + optional visit)
