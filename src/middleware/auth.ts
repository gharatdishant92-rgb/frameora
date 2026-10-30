import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { profiles } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
    displayName?: string;
    profileId?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    // 1. Check if token is a demo token (for quick testing/demo)
    if (token.startsWith('demo_token_')) {
      const parts = token.split('_');
      const role = parts[2] || 'customer';
      const uid = parts[3] || 'demo-user-1';
      const email = parts[4] || `${role}@frameora.com`;

      const existing = await db.select().from(profiles).where(eq(profiles.uid, uid)).limit(1);
      let profileId = existing[0]?.id;
      if (!profileId) {
        profileId = `prof_${uid}`;
        await db.insert(profiles).values({
          id: profileId,
          uid,
          email,
          displayName: role === 'admin' ? 'Studio Director (Admin)' : 'Valued Client',
          role: role === 'admin' ? 'admin' : (role === 'photographer' ? 'photographer' : 'customer'),
        }).onConflictDoNothing();
      }

      req.user = {
        uid,
        email,
        role: existing[0]?.role || role,
        displayName: existing[0]?.displayName || (role === 'admin' ? 'Studio Director' : 'Valued Client'),
        profileId: profileId || existing[0]?.id,
      };
      return next();
    }

    // 2. Otherwise verify with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email || '';
    const uid = decodedToken.uid;

    // Fetch or create profile
    let existing = await db.select().from(profiles).where(eq(profiles.uid, uid)).limit(1);
    let profile = existing[0];

    if (!profile) {
      const isOwnerAdmin = email === 'gharatdishant92@gmail.com' || email.endsWith('@frameora.com');
      const newId = `prof_${uid}`;
      await db.insert(profiles).values({
        id: newId,
        uid,
        email,
        displayName: decodedToken.name || email.split('@')[0],
        avatarUrl: decodedToken.picture || null,
        role: isOwnerAdmin ? 'admin' : 'customer',
      }).onConflictDoNothing();

      existing = await db.select().from(profiles).where(eq(profiles.uid, uid)).limit(1);
      profile = existing[0];
    }

    req.user = {
      uid,
      email,
      role: profile?.role || 'customer',
      displayName: profile?.displayName || decodedToken.name || email.split('@')[0],
      profileId: profile?.id || `prof_${uid}`,
    };
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication credentials' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
