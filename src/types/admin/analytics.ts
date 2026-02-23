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

export type AdminAnalyticsOverviewData = {
   period_days: number;
   summary: AnalyticsSummary;
   timeseries: AnalyticsTimeseriesItem[];
   top_pages: AnalyticsTopPage[];
   top_sources: AnalyticsTopSource[];
   top_countries: AnalyticsTopCountry[];
   updated_at: string;
};

export type AdminAnalyticsOverviewResponse = {
   message: string;
   data: AdminAnalyticsOverviewData | null;
   errors: unknown;
};