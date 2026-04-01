// Cloudflare R2 file storage
// - r2Client (S3-compatible client using AWS SDK)
// - uploadFile(file, path) → returns public URL
// - deleteFile(path)
// - getSignedUrl(path) — if using private bucket
// - Used for: doctor photos, patient reports, scans
