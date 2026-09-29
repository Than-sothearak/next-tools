# Tools

A bilingual (English and Khmer) browser-first collection of everyday tools, built with Next.js App Router, TypeScript, Tailwind CSS, Clerk, and Lucide.

## Run locally

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local` and add your Clerk keys.
3. In the Clerk Dashboard, enable Google as a social connection.
4. Install and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The app redirects to `/en`; switch languages in the navbar to use `/km`. Without Clerk keys, the app runs in local preview mode and tool processing remains available for development.

## Implemented browser tools

Image to PDF, Merge PDF, Split PDF, Compress Image, Resize Image, JPG to PNG, PNG to JPG, Image to WebP, WebP to JPG, QR Code Generator, JSON Formatter and Validator, Base64 and URL encode/decode, UUID Generator, Password Generator, Word Counter, Case Converter, duplicate line removal, text sorting, and whitespace cleanup.

Other registered tools have translated descriptions and routes marked Coming Soon. PDF merging, splitting, and image-to-PDF use `pdf-lib`; image operations use the browser canvas; QR generation and developer/text tools stay client-side.
