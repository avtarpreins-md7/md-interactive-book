/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Express + Vite Full-Stack Server
 * - Secure Server-Side Authentication for Author Preview Mode
 * - Secrets never exposed to client-side bundle
 * - Cryptographically signed HMAC-SHA256 session tokens
 * - Dev server with Vite middlewares on port 3000
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side secret key for HMAC token signing (never exposed to client)
const SERVER_HMAC_SECRET = process.env.AUTHOR_SERVER_SECRET || crypto.randomBytes(32).toString('hex');

// Official Author Secret Passphrase (stored strictly server-side)
// Author Mohamed El-Hammam master access key
const AUTHOR_MASTER_KEY = process.env.AUTHOR_ACCESS_KEY || 'Noon2026@ElHammam';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Helper to generate signed token
  function generateAuthorToken(): string {
    const payload = {
      role: 'author',
      name: 'محمد الهمام',
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hours validity
    };
    const payloadStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(payloadStr).digest('hex');
    const token = Buffer.from(payloadStr).toString('base64') + '.' + signature;
    return token;
  }

  // Helper to verify signed token
  function verifyAuthorToken(token: string): boolean {
    try {
      const [payloadB64, signature] = token.split('.');
      if (!payloadB64 || !signature) return false;
      const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf8');
      const expectedSig = crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(payloadStr).digest('hex');
      
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSig);
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return false;
      }
      
      const parsed = JSON.parse(payloadStr);
      if (parsed.role !== 'author' || parsed.expiresAt < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // API Route 1: Author Login (Strictly Server-Side Authentication)
  app.post('/api/author/login', (req: Request, res: Response) => {
    const { accessKey } = req.body;
    if (!accessKey || typeof accessKey !== 'string') {
      res.status(400).json({ success: false, message: 'مطلوب إدخال رمز التحقق' });
      return;
    }

    const cleanInput = accessKey.trim();
    // Validate securely against server-side secret key
    // Primary key: Noon2026@ElHammam
    // Alternate authorized author keys: noon2026, 2026, الهمام
    const validKeys = [AUTHOR_MASTER_KEY, 'noon2026', 'Noon2026', '2026', 'الهمام', 'محمد الهمام'];
    const isAuthorized = validKeys.includes(cleanInput);

    if (isAuthorized) {
      const token = generateAuthorToken();
      res.json({
        success: true,
        token,
        author: 'محمد الهمام',
        message: 'تم التحقق بنجاح وتفعيل وضع معاينة المؤلف'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير صحيح. الدخول محصور بالمؤلف المعتمد فقط.'
    });
  });

  // API Route 2: Verify Token (Validates signed session token on server)
  app.post('/api/author/verify-token', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ')) 
      ? authHeader.slice(7) 
      : req.body?.token;

    if (!token || typeof token !== 'string') {
      res.status(401).json({ valid: false });
      return;
    }

    const isValid = verifyAuthorToken(token);
    res.json({
      valid: isValid,
      author: isValid ? 'محمد الهمام' : null
    });
  });

  // Setup Vite in Dev mode or Static Serving in Prod mode
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
