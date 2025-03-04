// This file is deprecated and no longer in use.
// We're now using the hooks/use-auth.tsx implementation instead.
// This file is kept for reference and will be removed in a future update.

import { useAuth as actualUseAuth } from '@/hooks/use-auth';

// Re-export the hook to maintain compatibility
export const useAuth = actualUseAuth;