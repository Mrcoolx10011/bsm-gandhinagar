import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

// Helper function to check if token is valid
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
      checkAuth: () => {
        const token = localStorage.getItem('token');
        const { isAuthenticated, user } = get();
        
        // If we have a valid token but not authenticated, try to restore auth state
        if (isTokenValid(token) && (!isAuthenticated || !user)) {
          // Token is valid but auth state is missing - this can happen on page refresh
          // We should ideally fetch user info from the token or API, but for now
          // we'll just set authenticated to true if we have a valid token
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const user = {
                id: payload.id || payload.userId || 'admin',
                username: payload.username || 'admin',
                email: payload.email || 'admin@bsmgandhinagar.org',
                role: payload.role || 'admin'
              };
              set({ user, isAuthenticated: true });
              return true;
            } catch {
              // If token is malformed, remove it
              localStorage.removeItem('token');
              set({ user: null, isAuthenticated: false });
              return false;
            }
          }
        }
        
        // If token is invalid but we think we're authenticated, clear auth state
        if (!isTokenValid(token) && isAuthenticated) {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
          return false;
        }
        
        return isAuthenticated && isTokenValid(token);
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);