import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  RefreshCw,
  Trash2,
  Clock,
  MessageCircle,
  Instagram,
  Radio,
  BarChart3,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AnalyticsSummary } from '../types.ts';

interface AdminAnalyticsProps {
  getAuthHeader: () => Record<string, string>;
  onShowToast: (msg: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ getAuthHeader, onShowToast }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/summary', {
        headers: {
          ...getAuthHeader()
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load real-time analytics data');
      }

      const json: AnalyticsSummary = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve live statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 15 seconds to stream real-time events
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleResetAnalytics = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/analytics/clear', {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error('Failed to clear analytics log');
      onShowToast('Analytics data reset successfully');
      setConfirmResetOpen(false);
      await fetchAnalytics();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to reset analytics');
    } finally {
      setResetting(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return timestamp;
    }
  };

  const formatFullDateTime = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <RefreshCw className="w-8 h-8 text-[#e2417e] animate-spin mb-3" />
        <p className="text-sm text-[#b8a89d]">Connecting to live analytics feed...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center">
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs mb-4">
          {error}
        </div>
        <button
          onClick={() => fetchAnalytics()}
          className="px-4 py-2 rounded-xl bg-[#e2417e] text-white text-xs font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const summary = data || {
    totalVisits: 0,
    visitsToday: 0,
    visits7d: 0,
    totalOutreach: 0,
    outreachToday: 0,
    outreach7d: 0,
    conversionRate: '0.0%',
    locations: [],
    devices: [],
    recentVisits: [],
    recentOutreach: []
  };

  const topLocation = summary.locations.length > 0 ? summary.locations[0].location : 'Lagos, Nigeria';

  return (
    <div className="space-y-6">
      {/* Live Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.1)] shrink-0">
            <Radio className="w-5 h-5 text-[#e2417e]" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#f5ece2]">
                Real-Time Traffic &amp; Outreach Tracker
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Recording
              </span>
            </div>
            <p className="text-xs text-[#b8a89d] mt-0.5">
              Accurate, zero-AI genuine visitor impressions and WhatsApp leads logged in real time.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAnalytics()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#f5ece2] bg-[#1f1a15] hover:bg-[#29221b] border border-[rgba(245,236,226,0.12)] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh current stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#e2417e] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 transition-colors cursor-pointer"
            title="Clear all recorded test analytics"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Key Performance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] shadow-sm">
          <div className="flex items-center justify-between text-[#b8a89d] text-xs font-medium mb-2">
            <span className="uppercase tracking-wider">Total Visitors</span>
            <div className="p-2 rounded-xl bg-[#1f1a15] text-[#e2417e]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#f5ece2]">
            {summary.totalVisits.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#b8a89d] pt-2 border-t border-[rgba(245,236,226,0.08)]">
            <span>Today: <strong className="text-emerald-400">+{summary.visitsToday}</strong></span>
            <span>Past 7d: <strong className="text-[#f5ece2]">{summary.visits7d}</strong></span>
          </div>
        </div>

        {/* Customer Outreach Inquiries */}
        <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] shadow-sm">
          <div className="flex items-center justify-between text-[#b8a89d] text-xs font-medium mb-2">
            <span className="uppercase tracking-wider">Reached Out (Leads)</span>
            <div className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#f5ece2]">
            {summary.totalOutreach.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#b8a89d] pt-2 border-t border-[rgba(245,236,226,0.08)]">
            <span>Today: <strong className="text-emerald-400">+{summary.outreachToday}</strong></span>
            <span>Past 7d: <strong className="text-[#f5ece2]">{summary.outreach7d}</strong></span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] shadow-sm">
          <div className="flex items-center justify-between text-[#b8a89d] text-xs font-medium mb-2">
            <span className="uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-[#1f1a15] text-[#e2417e]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#f5ece2]">
            {summary.conversionRate}
          </div>
          <div className="mt-2.5 text-[11px] text-[#b8a89d] pt-2 border-t border-[rgba(245,236,226,0.08)]">
            Visitors who initiated WhatsApp/Instagram orders
          </div>
        </div>

        {/* Top Market */}
        <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] shadow-sm">
          <div className="flex items-center justify-between text-[#b8a89d] text-xs font-medium mb-2">
            <span className="uppercase tracking-wider">Top Location</span>
            <div className="p-2 rounded-xl bg-[#1f1a15] text-[#e2417e]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#f5ece2] truncate" title={topLocation}>
            {topLocation}
          </div>
          <div className="mt-2.5 text-[11px] text-[#b8a89d] pt-2 border-t border-[rgba(245,236,226,0.08)] truncate">
            {summary.locations.length} distinct region{summary.locations.length === 1 ? '' : 's'} recorded
          </div>
        </div>
      </div>

      {/* Breakdown Section: Geographic Locations & Device Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Locations and Percentages (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif font-bold text-base text-[#f5ece2] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e2417e]" />
                <span>Visitor Locations &amp; Traffic Percentages</span>
              </h3>
              <p className="text-xs text-[#b8a89d] mt-0.5">
                Exact geographic split calculated from incoming visitor connection data.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#b8a89d] bg-[#1f1a15] px-2.5 py-1 rounded-full border border-[rgba(245,236,226,0.08)]">
              {summary.locations.length} Location{summary.locations.length === 1 ? '' : 's'}
            </span>
          </div>

          {summary.locations.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#b8a89d]">
              <Globe className="w-8 h-8 text-[#b8a89d]/40 mx-auto mb-2" />
              <p>No location data recorded yet. As customers open your link, locations appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.locations.map((loc, idx) => (
                <div key={loc.location} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#f5ece2] flex items-center gap-2">
                      <span className="w-5 text-[11px] text-[#b8a89d] font-mono">#{idx + 1}</span>
                      <span>{loc.location}</span>
                    </span>
                    <span className="text-[#b8a89d] font-mono">
                      <strong className="text-[#f5ece2]">{loc.percentage}%</strong> ({loc.count} {loc.count === 1 ? 'visit' : 'visits'})
                    </span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-[#1f1a15] rounded-full overflow-hidden border border-[rgba(245,236,226,0.05)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, Math.min(100, loc.percentage))}%`,
                        backgroundColor: idx === 0 ? '#e2417e' : idx === 1 ? '#f5ece2' : '#b8a89d'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Spread Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)]">
          <h3 className="font-serif font-bold text-base text-[#f5ece2] mb-1 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#e2417e]" />
            <span>Devices Used</span>
          </h3>
          <p className="text-xs text-[#b8a89d] mb-5">
            What your customers browse from.
          </p>

          <div className="space-y-4">
            {summary.devices.map((dev) => {
              const icon =
                dev.device === 'mobile' ? (
                  <Smartphone className="w-4 h-4 text-[#e2417e]" />
                ) : dev.device === 'tablet' ? (
                  <Tablet className="w-4 h-4 text-[#f5ece2]" />
                ) : (
                  <Monitor className="w-4 h-4 text-[#b8a89d]" />
                );

              return (
                <div key={dev.device} className="p-3.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.08)]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2 font-medium capitalize text-[#f5ece2]">
                      {icon}
                      <span>{dev.device}</span>
                    </div>
                    <span className="font-mono text-[#f5ece2] font-semibold">
                      {dev.percentage}% ({dev.count})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0e0c0b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e2417e] rounded-full transition-all"
                      style={{ width: `${dev.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Real Customer Outreach Inquiries Log (The High Value Leads) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#f5ece2] flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Customer Outreach &amp; Lead Inquiries</span>
            </h3>
            <p className="text-xs text-[#b8a89d] mt-0.5">
              Live log of customers who clicked WhatsApp or Instagram to purchase or inquire.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {summary.recentOutreach.length} Inquir{summary.recentOutreach.length === 1 ? 'y' : 'ies'} Logged
          </span>
        </div>

        {summary.recentOutreach.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#b8a89d] bg-[#1f1a15]/40 rounded-xl border border-[rgba(245,236,226,0.05)]">
            <MessageCircle className="w-8 h-8 text-[#b8a89d]/30 mx-auto mb-2" />
            <p className="font-medium text-[#f5ece2]">No customer reach outs yet</p>
            <p className="mt-1 text-[11px]">When someone clicks "Order now" or "WhatsApp", their inquiry will appear here with the exact package name.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(245,236,226,0.08)] text-[#b8a89d] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Package Requested</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(245,236,226,0.05)]">
                {summary.recentOutreach.map((out) => (
                  <tr key={out.id} className="hover:bg-[#1f1a15]/50 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[#f5ece2] font-medium block">
                        {formatRelativeTime(out.timestamp)}
                      </span>
                      <span className="text-[10px] text-[#b8a89d]/70 block">
                        {formatFullDateTime(out.timestamp)}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {out.channel === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#e2417e]/15 text-[#e2417e] border border-[#e2417e]/30">
                          <Instagram className="w-3 h-3" />
                          <span>Instagram</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#f5ece2] font-medium max-w-xs truncate">
                      {out.package_title || 'General Surprise Consultation'}
                    </td>
                    <td className="py-3 px-3 text-[#b8a89d] whitespace-nowrap flex items-center gap-1 mt-2.5">
                      <MapPin className="w-3 h-3 text-[#e2417e] shrink-0" />
                      <span>{out.location || 'Lagos, Nigeria'}</span>
                    </td>
                    <td className="py-3 px-3 text-[#b8a89d] whitespace-nowrap capitalize">
                      {out.device}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Visitor Feed */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#f5ece2] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e2417e]" />
              <span>Recent Site Visitors Stream</span>
            </h3>
            <p className="text-xs text-[#b8a89d] mt-0.5">
              Live timeline of real people visiting your website.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#b8a89d] bg-[#1f1a15] px-2.5 py-1 rounded-full border border-[rgba(245,236,226,0.08)]">
            Latest {summary.recentVisits.length} visits
          </span>
        </div>

        {summary.recentVisits.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#b8a89d]">
            <Clock className="w-6 h-6 text-[#b8a89d]/40 mx-auto mb-2" />
            <p>No site visits logged yet. Real visits will stream here live as visitors open your website.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {summary.recentVisits.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-[#1f1a15]/60 border border-[rgba(245,236,226,0.06)] flex items-center justify-between gap-3 text-xs hover:border-[rgba(245,236,226,0.15)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#17140f] border border-[rgba(245,236,226,0.08)] flex items-center justify-center shrink-0 text-[#e2417e]">
                    {v.device === 'mobile' ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : v.device === 'tablet' ? (
                      <Tablet className="w-3.5 h-3.5" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[#f5ece2] font-medium flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#e2417e]" />
                      <span>{v.location || 'Lagos, Nigeria'}</span>
                    </span>
                    <span className="text-[10px] text-[#b8a89d]/75 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{v.device}</span>
                      <span>•</span>
                      <span>{v.browser || 'Browser'}</span>
                      <span>•</span>
                      <span>Page: {v.page || '/'}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-[#f5ece2] text-xs font-mono">
                    {formatRelativeTime(v.timestamp)}
                  </span>
                  <span className="text-[10px] text-[#b8a89d]/60 block font-mono">
                    {formatFullDateTime(v.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal to Reset Analytics */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17140f] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-lg text-[#f5ece2] mb-1">
              Reset Analytics Logs?
            </h4>
            <p className="text-xs text-[#b8a89d] mb-6 leading-relaxed">
              This will clear all recorded visitor and outreach history to give you a clean slate. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1f1a15] text-xs text-[#b8a89d] hover:text-[#f5ece2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetAnalytics}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Yes, Clear All Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
