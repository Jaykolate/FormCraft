import { verifyToken } from '@clerk/backend';

export const clerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Bypass Clerk validation for testing purposes if token starts with "mock_" or during testing
  if (process.env.NODE_ENV === 'test' || token.startsWith('mock_')) {
    req.userId = token.replace('mock_', '') || 'mock_user_id';
    return next();
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error('Configuration Error: CLERK_SECRET_KEY is missing from environment variables');
    return res.status(500).json({ error: 'Internal Server Error: Auth configuration missing' });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    // Clerk token payload contains 'sub' as the Clerk User ID
    req.userId = payload.sub;
    next();
  } catch (error) {
    console.error('Clerk token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
