/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Production Gateway for Administrative Suite
 * Encapsulates all administrative dependencies, login rituals, and dashboard operations.
 * When administrative access is disabled via build flag or in pure public builds, this entire
 * module is excluded from client bundles or safely redirected to the luxury 404 page.
 */

import React from 'react';
import { Package, SiteSettings, BookingOrder, ReelItem, ServiceCategoryCard } from '../types.ts';
import { AdminLogin } from '../components/AdminLogin.tsx';
import { AdminDashboard } from '../components/AdminDashboard.tsx';

interface AdminGatewayProps {
  viewMode: 'admin-login' | 'admin-dashboard';
  packages: Package[];
  settings: SiteSettings;
  bookings: BookingOrder[];
  reels: ReelItem[];
  services: ServiceCategoryCard[];
  onRefreshPackages: () => Promise<void>;
  onUpdateSettings: (settings: SiteSettings) => Promise<void>;
  onLogout: () => void;
  onBackToSite: () => void;
  onUpdateBookings: (bookings: BookingOrder[]) => void;
  onUpdateReels: (reels: ReelItem[]) => void;
  onUpdateServices: (services: ServiceCategoryCard[]) => void;
  onLoginSuccess: () => void;
}

export const AdminGateway: React.FC<AdminGatewayProps> = ({
  viewMode,
  packages,
  settings,
  bookings,
  reels,
  services,
  onRefreshPackages,
  onUpdateSettings,
  onLogout,
  onBackToSite,
  onUpdateBookings,
  onUpdateReels,
  onUpdateServices,
  onLoginSuccess
}) => {
  if (viewMode === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={onLoginSuccess}
        onBackToSite={onBackToSite}
      />
    );
  }

  return (
    <AdminDashboard
      packages={packages}
      settings={settings}
      bookings={bookings}
      reels={reels}
      services={services}
      onRefreshPackages={onRefreshPackages}
      onUpdateSettings={onUpdateSettings}
      onLogout={onLogout}
      onBackToSite={onBackToSite}
      onUpdateBookings={onUpdateBookings}
      onUpdateReels={onUpdateReels}
      onUpdateServices={onUpdateServices}
    />
  );
};

export default AdminGateway;
