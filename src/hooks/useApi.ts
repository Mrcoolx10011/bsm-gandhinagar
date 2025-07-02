import { useState } from 'react';
import toast from 'react-hot-toast';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
  showToast?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const apiCall = async <T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      body,
      requiresAuth = false,
      showToast = true
    } = options;

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const url = endpoint.startsWith('/') ? `${apiUrl}${endpoint}` : `${apiUrl}/${endpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth token if required
      if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
          if (showToast) {
            toast.error('Authentication required. Please login again.');
          }
          setLoading(false);
          return { data: null, error: 'No authentication token', loading: false };
        }
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🚀 API Call: ${method} ${url}`, { body, headers });

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const textData = await response.text();
        console.warn('Non-JSON response:', textData);
        data = { message: textData || 'Unknown response' };
      }

      if (response.ok) {
        console.log('✅ Success:', data);
        setLoading(false);
        return { data, error: null, loading: false };
      } else {
        const errorMessage = data?.message || data?.error || `Request failed: ${response.status}`;
        console.error('❌ API Error:', errorMessage, data);
        
        if (showToast) {
          toast.error(errorMessage);
        }
        
        setLoading(false);
        return { data: null, error: errorMessage, loading: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('❌ Network Error:', error);
      
      if (showToast) {
        toast.error(`Network error: ${errorMessage}`);
      }
      
      setLoading(false);
      return { data: null, error: errorMessage, loading: false };
    }
  };

  return { apiCall, loading };
};

// Convenience hooks for common operations
export const useLogin = () => {
  const { apiCall } = useApi();

  const login = async (credentials: { username: string; password: string }) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
      requiresAuth: false,
      showToast: false // Handle toast manually for better UX
    });
  };

  return { login };
};

export const useMembers = () => {
  const { apiCall } = useApi();

  const getMembers = async (isPublic = false) => {
    const endpoint = isPublic ? '/members?public=true' : '/members';
    return apiCall(endpoint, {
      requiresAuth: !isPublic
    });
  };

  const createMember = async (memberData: any) => {
    return apiCall('/members', {
      method: 'POST',
      body: memberData,
      requiresAuth: true
    });
  };

  const updateMember = async (id: string, memberData: any) => {
    return apiCall(`/members?id=${id}`, {
      method: 'PUT',
      body: memberData,
      requiresAuth: true
    });
  };

  const deleteMember = async (id: string) => {
    return apiCall(`/members?id=${id}`, {
      method: 'DELETE',
      requiresAuth: true
    });
  };

  return { getMembers, createMember, updateMember, deleteMember };
};

export const usePosts = () => {
  const { apiCall } = useApi();

  const getPosts = async () => {
    return apiCall('/posts');
  };

  const createPost = async (postData: any) => {
    return apiCall('/posts', {
      method: 'POST',
      body: postData,
      requiresAuth: true
    });
  };

  const updatePost = async (postData: any) => {
    return apiCall('/posts', {
      method: 'PUT',
      body: postData,
      requiresAuth: true
    });
  };

  const deletePost = async (id: string) => {
    return apiCall(`/posts?id=${id}`, {
      method: 'DELETE',
      requiresAuth: true
    });
  };

  return { getPosts, createPost, updatePost, deletePost };
};

export default useApi;
