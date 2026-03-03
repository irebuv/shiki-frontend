import api from '@/api/axios';
import { AdminAnalyticsOverviewResponse, AdminAnalyticsRealtimeResponse } from '@/types/admin/analytics';

export async function fetchAdminAnalyticsOverview(
    days = 14,
): Promise<AdminAnalyticsOverviewResponse> {
    const { data } = await api.get<AdminAnalyticsOverviewResponse>('/admin/analytics/overview', {
        params: { days },
    });

    return data;
}

export async function fetchAdminAnalyticsRealtime(): Promise<AdminAnalyticsRealtimeResponse> {
   const {data} = await api.get<AdminAnalyticsRealtimeResponse>('/admin/analytics/realtime');
   return data;
}
