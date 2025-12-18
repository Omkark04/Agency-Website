# backend/analytics/ga4_service.py
"""
Google Analytics 4 Data API Service
Fetches analytics data from GA4 for admin dashboard
"""

import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
    RunRealtimeReportRequest,
)
from google.oauth2 import service_account


class GA4Service:
    """Service class for interacting with Google Analytics 4 Data API"""
    
    def __init__(self):
        """Initialize GA4 client with service account credentials"""
        self.property_id = os.getenv('GA4_PROPERTY_ID')
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        
        if not self.property_id:
            raise ValueError("GA4_PROPERTY_ID not found in environment variables")
        
        if not credentials_path or not os.path.exists(credentials_path):
            raise ValueError(f"Service account credentials not found at: {credentials_path}")
        
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/analytics.readonly']
        )
        
        self.client = BetaAnalyticsDataClient(credentials=credentials)
    
    def get_realtime_users(self) -> Dict[str, Any]:
        """Get real-time active users"""
        try:
            request = RunRealtimeReportRequest(
                property=self.property_id,
                metrics=[Metric(name="activeUsers")],
            )
            
            response = self.client.run_realtime_report(request)
            
            active_users = 0
            if response.rows:
                active_users = int(response.rows[0].metric_values[0].value)
            
            return {
                'active_users': active_users,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching realtime users: {e}")
            return {'active_users': 0, 'error': str(e)}
    
    def get_overview_metrics(self, days: int = 7) -> Dict[str, Any]:
        """Get overview metrics for specified number of days"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                metrics=[
                    Metric(name="totalUsers"),
                    Metric(name="sessions"),
                    Metric(name="averageSessionDuration"),
                    Metric(name="bounceRate"),
                    Metric(name="screenPageViews"),
                ],
            )
            
            response = self.client.run_report(request)
            
            if response.rows:
                row = response.rows[0]
                return {
                    'total_users': int(row.metric_values[0].value),
                    'sessions': int(row.metric_values[1].value),
                    'avg_session_duration': float(row.metric_values[2].value),
                    'bounce_rate': float(row.metric_values[3].value),
                    'page_views': int(row.metric_values[4].value),
                    'period_days': days
                }
            
            return self._empty_overview()
        except Exception as e:
            print(f"Error fetching overview metrics: {e}")
            return {'error': str(e), **self._empty_overview()}
    
    def get_page_views_trend(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get page views trend over time"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                dimensions=[Dimension(name="date")],
                metrics=[Metric(name="screenPageViews")],
                order_bys=[{"dimension": {"dimension_name": "date"}}]
            )
            
            response = self.client.run_report(request)
            
            trend_data = []
            for row in response.rows:
                date_str = row.dimension_values[0].value
                page_views = int(row.metric_values[0].value)
                
                # Format date as YYYY-MM-DD
                formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
                
                trend_data.append({
                    'date': formatted_date,
                    'page_views': page_views
                })
            
            return trend_data
        except Exception as e:
            print(f"Error fetching page views trend: {e}")
            return []
    
    def get_top_pages(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing pages"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                dimensions=[
                    Dimension(name="pagePath"),
                    Dimension(name="pageTitle")
                ],
                metrics=[
                    Metric(name="screenPageViews"),
                    Metric(name="averageSessionDuration"),
                    Metric(name="bounceRate"),
                ],
                limit=limit,
                order_bys=[{"metric": {"metric_name": "screenPageViews"}, "desc": True}]
            )
            
            response = self.client.run_report(request)
            
            pages = []
            for row in response.rows:
                pages.append({
                    'page_path': row.dimension_values[0].value,
                    'page_title': row.dimension_values[1].value,
                    'page_views': int(row.metric_values[0].value),
                    'avg_time': float(row.metric_values[1].value),
                    'bounce_rate': float(row.metric_values[2].value),
                })
            
            return pages
        except Exception as e:
            print(f"Error fetching top pages: {e}")
            return []
    
    def get_traffic_sources(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get traffic sources breakdown"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                dimensions=[Dimension(name="sessionDefaultChannelGroup")],
                metrics=[
                    Metric(name="sessions"),
                    Metric(name="totalUsers"),
                ],
                order_bys=[{"metric": {"metric_name": "sessions"}, "desc": True}]
            )
            
            response = self.client.run_report(request)
            
            sources = []
            for row in response.rows:
                sources.append({
                    'source': row.dimension_values[0].value,
                    'sessions': int(row.metric_values[0].value),
                    'users': int(row.metric_values[1].value),
                })
            
            return sources
        except Exception as e:
            print(f"Error fetching traffic sources: {e}")
            return []
    
    def get_device_breakdown(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get device category breakdown"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                dimensions=[Dimension(name="deviceCategory")],
                metrics=[
                    Metric(name="sessions"),
                    Metric(name="totalUsers"),
                ],
            )
            
            response = self.client.run_report(request)
            
            devices = []
            for row in response.rows:
                devices.append({
                    'device': row.dimension_values[0].value,
                    'sessions': int(row.metric_values[0].value),
                    'users': int(row.metric_values[1].value),
                })
            
            return devices
        except Exception as e:
            print(f"Error fetching device breakdown: {e}")
            return []
    
    def get_user_demographics(self, days: int = 7) -> Dict[str, Any]:
        """Get user demographics (age, gender, location)"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get country data
            country_request = RunReportRequest(
                property=self.property_id,
                date_ranges=[DateRange(
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )],
                dimensions=[Dimension(name="country")],
                metrics=[Metric(name="totalUsers")],
                limit=10,
                order_bys=[{"metric": {"metric_name": "totalUsers"}, "desc": True}]
            )
            
            country_response = self.client.run_report(country_request)
            
            countries = []
            for row in country_response.rows:
                countries.append({
                    'country': row.dimension_values[0].value,
                    'users': int(row.metric_values[0].value),
                })
            
            return {
                'countries': countries,
            }
        except Exception as e:
            print(f"Error fetching demographics: {e}")
            return {'countries': []}
    
    def _empty_overview(self) -> Dict[str, int]:
        """Return empty overview metrics"""
        return {
            'total_users': 0,
            'sessions': 0,
            'avg_session_duration': 0,
            'bounce_rate': 0,
            'page_views': 0,
            'period_days': 0
        }


# Singleton instance
_ga4_service = None

def get_ga4_service() -> GA4Service:
    """Get or create GA4 service instance"""
    global _ga4_service
    if _ga4_service is None:
        _ga4_service = GA4Service()
    return _ga4_service
