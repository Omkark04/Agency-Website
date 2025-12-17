import api from './api';

export interface NewsletterSubscription {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  subscribed_at: string;
  is_active: boolean;
}

export const subscribeNewsletter = () => {
  return api.post<any>('/api/newsletter/subscribe/');
};

export const unsubscribeNewsletter = () => {
  return api.post<any>('/api/newsletter/unsubscribe/');
};

export const getSubscriptionStatus = () => {
  return api.get<NewsletterSubscription>('/api/newsletter/status/');
};
