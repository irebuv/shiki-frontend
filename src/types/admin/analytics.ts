export type AnalyticsSummary = {
   active_users: number;
   new_users: number;
   sessions: number;
   views: number;
   engagement_rate: number;
   avg_session_duration_sec: number;
};

export type AnalyticsTimeseriesItem = {
   date: string;
   active_users: number;
   views: number;
};

export type AnalyticsTopPage = {
   path: string;
   views: number;
};

export type AnalyticsTopSource = {
   source: string;
   sessions: number;
};

export type AnalyticsTopCountry = {
   country: string;
   users: number;
};

export type AnalyticsTopLocation = {
   location: string;
   users: number;
};

export type AdminAnalyticsOverviewData = {
   period_days: number;
   summary: AnalyticsSummary;
   timeseries: AnalyticsTimeseriesItem[];
   top_pages: AnalyticsTopPage[];
   top_sources: AnalyticsTopSource[];
   top_countries?: AnalyticsTopCountry[];
   top_locations?: AnalyticsTopLocation[];
   updated_at: string;
};

export type AdminAnalyticsOverviewResponse = {
   message: string;
   data: AdminAnalyticsOverviewData | null;
   errors: unknown;
};


// realtime analytics
export type AnalyticsRealtimeSummary = {
   active_users_last_30_min: number;
   views_last_30_min: number;
   events_last_30_min: number;
};

export type AnalyticsRealtimeTopPage = {
   path: string;
   users: number;
   views: number;
};

export type AdminAnalyticsRealtimeData = {
   summary: AnalyticsRealtimeSummary;
   top_pages: AnalyticsRealtimeTopPage[];
   top_locations: AnalyticsTopLocation[];
   updated_at: string;
};

export type AdminAnalyticsRealtimeResponse = {
   message: string;
   data: AdminAnalyticsRealtimeData | null;
   errors: unknown;
}