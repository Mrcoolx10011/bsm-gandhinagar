import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DashboardOverview } from '../../components/admin/DashboardOverview';
import { MembersManagement } from '../../components/admin/MembersManagement-new';
import { EventsManagement } from '../../components/admin/EventsManagement';
import { DonationsManagement } from '../../components/admin/DonationsManagement';
import { InquiriesManagement } from '../../components/admin/InquiriesManagement';
import { PostsManagement } from '../../components/admin/PostsManagement';
import { AdminSettings } from '../../components/admin/AdminSettings';

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/members" element={<MembersManagement />} />
        <Route path="/events" element={<EventsManagement />} />
        <Route path="/donations" element={<DonationsManagement />} />
        <Route path="/inquiries" element={<InquiriesManagement />} />
        <Route path="/posts" element={<PostsManagement />} />
        <Route path="/settings" element={<AdminSettings />} />
        {/* Redirect any unknown admin routes to dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};