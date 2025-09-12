import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  priority: 'low' | 'medium' | 'high';
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/consolidated?endpoint=inquiries', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inquiries: ${response.statusText}`);
      }

      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch inquiries');
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiry = async (id: string, updates: Partial<Inquiry>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/consolidated?endpoint=inquiries&id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update inquiry: ${response.statusText}`);
      }

      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry._id === id ? { ...inquiry, ...updates, updatedAt: new Date().toISOString() } : inquiry
        )
      );

      toast.success('Inquiry updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
      return false;
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/consolidated?endpoint=inquiries&id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete inquiry: ${response.statusText}`);
      }

      // Update local state
      setInquiries(prev => prev.filter(inquiry => inquiry._id !== id));
      toast.success('Inquiry deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
      return false;
    }
  };

  const submitInquiry = async (inquiryData: Omit<Inquiry, '_id' | 'createdAt' | 'status' | 'priority'>) => {
    try {
      const response = await fetch('/api/consolidated?endpoint=inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryData,
          priority: 'medium',
          status: 'new'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit inquiry: ${response.statusText}`);
      }

      const newInquiry = await response.json();
      
      // Add to local state if we're currently viewing inquiries
      setInquiries(prev => [newInquiry, ...prev]);
      
      return newInquiry;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const refetch = fetchInquiries;

  return {
    inquiries,
    loading,
    error,
    updateInquiry,
    deleteInquiry,
    submitInquiry,
    refetch
  };
};
