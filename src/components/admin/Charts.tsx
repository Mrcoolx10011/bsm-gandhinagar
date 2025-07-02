import React, { useEffect, useState } from 'react';
import { TrendingUp, Heart, Users } from 'lucide-react';
import { makeAuthenticatedRequest } from '../../utils/auth';

interface ChartData {
  membersByMonth: Array<{ month: string; count: number }>;
  donationsByMonth: Array<{ month: string; amount: number; count: number }>;
  loading: boolean;
  error: string | null;
}

export const Charts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    membersByMonth: [],
    donationsByMonth: [],
    loading: true,
    error: null
  });

  const fetchChartData = async () => {
    try {
      setChartData(prev => ({ ...prev, loading: true, error: null }));

      const [membersRes, donationsRes] = await Promise.all([
        makeAuthenticatedRequest('/api/members'),
        makeAuthenticatedRequest('/api/donations')
      ]);

      if (membersRes.ok && donationsRes.ok) {
        const [members, donations] = await Promise.all([
          membersRes.json(),
          donationsRes.json()
        ]);

        // Process member data by month
        const membersByMonth = processDataByMonth(members, 'createdAt');
        
        // Process donation data by month
        const donationsByMonth = processDonationsByMonth(donations);

        setChartData({
          membersByMonth,
          donationsByMonth,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch chart data');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load chart data'
      }));
    }
  };

  const processDataByMonth = (data: any[], dateField: string) => {
    const monthCounts: { [key: string]: number } = {};
    const last6Months = getLast6Months();

    // Initialize with 0 counts
    last6Months.forEach(month => {
      monthCounts[month] = 0;
    });

    // Count items by month
    data.forEach(item => {
      const date = new Date(item[dateField] || item.joinDate || new Date());
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthCounts.hasOwnProperty(monthKey)) {
        monthCounts[monthKey]++;
      }
    });

    return last6Months.map(month => ({
      month,
      count: monthCounts[month]
    }));
  };

  const processDonationsByMonth = (donations: any[]) => {
    const monthData: { [key: string]: { amount: number; count: number } } = {};
    const last6Months = getLast6Months();

    // Initialize with 0 values
    last6Months.forEach(month => {
      monthData[month] = { amount: 0, count: 0 };
    });

    // Sum donations by month (only completed and approved)
    donations
      .filter(donation => donation.status === 'completed' && donation.approved !== false)
      .forEach(donation => {
        const date = new Date(donation.createdAt || new Date());
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthData.hasOwnProperty(monthKey)) {
          monthData[monthKey].amount += donation.amount || 0;
          monthData[monthKey].count++;
        }
      });

    return last6Months.map(month => ({
      month,
      amount: monthData[month].amount,
      count: monthData[month].count
    }));
  };

  const getLast6Months = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
    }
    
    return months;
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  if (chartData.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{chartData.error}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{chartData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Member Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Member Growth</h3>
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {chartData.membersByMonth.map((data) => (
            <div key={data.month} className="flex items-center">
              <div className="w-16 text-sm text-gray-600">{data.month}</div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.max(5, (data.count / Math.max(...chartData.membersByMonth.map(m => m.count), 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-8 text-sm text-gray-900 text-right">{data.count}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Total new members in last 6 months: {chartData.membersByMonth.reduce((sum, m) => sum + m.count, 0)}
        </div>
      </div>

      {/* Donation Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Donation Trends</h3>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div className="space-y-4">
          {chartData.donationsByMonth.map((data, index) => (
            <div key={data.month} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{data.month}</div>
                <div className="text-sm text-gray-900">₹{data.amount.toLocaleString()}</div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 mr-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(5, (data.amount / Math.max(...chartData.donationsByMonth.map(d => d.amount), 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{data.count} donations</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Total donations in last 6 months: ₹{chartData.donationsByMonth.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
