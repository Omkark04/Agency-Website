// frontend/src/hooks/useGoogleAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import * as ga4Api from '../api/googleAnalytics';
import type {
  GA4RealtimeData,
  GA4OverviewData,
  GA4Page,
  GA4Source,
  GA4Device,
  GA4Demographics
} from '../api/googleAnalytics';

interface UseGoogleAnalyticsReturn {
  realtime: GA4RealtimeData | null;
  overview: GA4OverviewData | null;
  pages: GA4Page[];
  sources: GA4Source[];
  devices: GA4Device[];
  demographics: GA4Demographics | null;
  loading: boolean;
  error: string | null;
  refetch: (days?: number) => Promise<void>;
}

export const useGoogleAnalytics = (initialDays: number = 7): UseGoogleAnalyticsReturn => {
  const [realtime, setRealtime] = useState<GA4RealtimeData | null>(null);
  const [overview, setOverview] = useState<GA4OverviewData | null>(null);
  const [pages, setPages] = useState<GA4Page[]>([]);
  const [sources, setSources] = useState<GA4Source[]>([]);
  const [devices, setDevices] = useState<GA4Device[]>([]);
  const [demographics, setDemographics] = useState<GA4Demographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(initialDays);

  const fetchAllData = useCallback(async (selectedDays: number) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        realtimeData,
        overviewData,
        pagesData,
        sourcesData,
        devicesData,
        demographicsData
      ] = await Promise.all([
        ga4Api.getGA4Realtime(),
        ga4Api.getGA4Overview(selectedDays),
        ga4Api.getGA4Pages(selectedDays, 10),
        ga4Api.getGA4Sources(selectedDays),
        ga4Api.getGA4Devices(selectedDays),
        ga4Api.getGA4Demographics(selectedDays),
      ]);

      setRealtime(realtimeData);
      setOverview(overviewData);
      setPages(pagesData.pages);
      setSources(sourcesData.sources);
      setDevices(devicesData.devices);
      setDemographics(demographicsData);
    } catch (err: any) {
      console.error('Error fetching GA4 data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async (newDays?: number) => {
    const selectedDays = newDays !== undefined ? newDays : days;
    setDays(selectedDays);
    await fetchAllData(selectedDays);
  }, [days, fetchAllData]);

  // Initial fetch
  useEffect(() => {
    fetchAllData(days);
  }, [fetchAllData, days]);

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const realtimeData = await ga4Api.getGA4Realtime();
        setRealtime(realtimeData);
      } catch (err) {
        console.error('Error refreshing realtime data:', err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    realtime,
    overview,
    pages,
    sources,
    devices,
    demographics,
    loading,
    error,
    refetch,
  };
};
