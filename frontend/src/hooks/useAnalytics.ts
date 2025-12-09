// frontend/src/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import * as analyticsApi from '../api/analytics';
import type { DashboardMetrics, ServicePerformance, UserActivity } from '../api/analytics';

interface UseAnalyticsReturn {
    dashboardMetrics: DashboardMetrics | null;
    servicePerformance: ServicePerformance | null;
    userActivity: UserActivity | null;
    loading: boolean;
    error: string | null;
    fetchDashboardMetrics: () => Promise<void>;
    fetchServicePerformance: () => Promise<void>;
    fetchUserActivity: () => Promise<void>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [servicePerformance, setServicePerformance] = useState<ServicePerformance | null>(null);
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardMetrics = useCallback(async () => {
        try {
            setLoading(true);
            const data = await analyticsApi.getDashboardMetrics();
            setDashboardMetrics(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch dashboard metrics');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServicePerformance = useCallback(async () => {
        try {
            const data = await analyticsApi.getServicePerformance();
            setServicePerformance(data);
        } catch (err: any) {
            console.error('Failed to fetch service performance:', err);
        }
    }, []);

    const fetchUserActivity = useCallback(async () => {
        try {
            const data = await analyticsApi.getUserActivity();
            setUserActivity(data);
        } catch (err: any) {
            console.error('Failed to fetch user activity:', err);
        }
    }, []);

    useEffect(() => {
        fetchDashboardMetrics();
        fetchServicePerformance();
        fetchUserActivity();
    }, [fetchDashboardMetrics, fetchServicePerformance, fetchUserActivity]);

    return {
        dashboardMetrics,
        servicePerformance,
        userActivity,
        loading,
        error,
        fetchDashboardMetrics,
        fetchServicePerformance,
        fetchUserActivity,
    };
};
