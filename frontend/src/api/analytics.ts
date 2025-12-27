import api from './api';

export interface DashboardMetrics {
    overview: {
        total_orders: number;
        recent_orders: number;
        total_revenue: number;
        recent_revenue: number;
        active_clients: number;
        team_members?: number;
        services_count?: number;
    };
    orders_by_status: Array<{
        status: string;
        count: number;
    }>;
    revenue_by_department?: Array<{
        service__department__title: string;
        revenue: number;
        order_count: number;
    }>;
    recent_orders: Array<{
        id: number;
        title: string;
        status: string;
        price: number;
        client__email: string;
        service__title: string;
        created_at: string;
    }>;
    department?: {
        id: number;
        title: string;
    };
    services_performance?: Array<{
        id: number;
        title: string;
        total_orders: number;
        total_revenue: number;
    }>;
}

export interface ServicePerformance {
    services: Array<{
        id: number;
        title: string;
        department__title: string;
        total_orders: number;
        total_revenue: number;
        completed_orders: number;
        pending_orders: number;
    }>;
}

export interface UserActivity {
    users_by_role: Array<{
        role: string;
        count: number;
    }>;
    recent_registrations: number;
    top_clients: Array<{
        id: number;
        email: string;
        order_count: number;
        total_spent: number;
    }>;
}

// Get dashboard overview metrics (admin only)
export const getDashboardMetrics = async () => {
    const response = await api.get<DashboardMetrics>('/api/analytics/dashboard/');
    return response.data;
};

// Get service performance statistics (admin only)
export const getServicePerformance = async () => {
    const response = await api.get<ServicePerformance>('/api/analytics/services/');
    return response.data;
};

// Get user activity metrics (admin only)
export const getUserActivity = async () => {
    const response = await api.get<UserActivity>('/api/analytics/users/');
    return response.data;
};

// Get service head dashboard metrics (service head only)
export const getServiceHeadMetrics = async () => {
    const response = await api.get<DashboardMetrics>('/api/analytics/service-head-metrics/');
    return response.data;
};
