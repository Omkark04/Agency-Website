from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import NewsletterSubscription
from .serializers import NewsletterSubscriptionSerializer
from notifications.models import Notification


class NewsletterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Newsletter Subscription
    """
    queryset = NewsletterSubscription.objects.all()
    serializer_class = NewsletterSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Subscribe current user to newsletter"""
        user = request.user
        
        # Check if already subscribed
        subscription, created = NewsletterSubscription.objects.get_or_create(
            user=user,
            defaults={'is_active': True}
        )
        
        if not created:
            if subscription.is_active:
                return Response(
                    {'detail': 'You are already subscribed to our newsletter'},
                    status=status.HTTP_200_OK
                )
            else:
                # Reactivate subscription
                subscription.is_active = True
                subscription.save()
        
        # Create notification
        Notification.objects.create(
            user=user,
            title="Newsletter Subscription Confirmed",
            message="You have successfully subscribed to our newsletter. You'll receive updates about new blog posts and announcements.",
            type="info"
        )

        # Send email notification
        try:
            from django.core.mail import send_mail
            send_mail(
                subject='Welcome to Our Newsletter!',
                message=f'Hi {user.username},\n\nThank you for subscribing to our newsletter. You will now receive updates about our latest blog posts and announcements.\n\nBest regards,\nUdyogWorks Team',
                from_email=None,  # Use DEFAULT_FROM_EMAIL
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send newsletter email: {e}")
        
        serializer = self.get_serializer(subscription)
        return Response(
            {
                'detail': 'Successfully subscribed to newsletter',
                'subscription': serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """Unsubscribe current user from newsletter"""
        user = request.user
        
        try:
            subscription = NewsletterSubscription.objects.get(user=user)
            subscription.is_active = False
            subscription.save()
            
            # Create notification
            Notification.objects.create(
                user=user,
                title="Newsletter Unsubscribed",
                message="You have been unsubscribed from our newsletter.",
                type="info"
            )
            
            return Response(
                {'detail': 'Successfully unsubscribed from newsletter'},
                status=status.HTTP_200_OK
            )
        except NewsletterSubscription.DoesNotExist:
            return Response(
                {'detail': 'You are not subscribed to the newsletter'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get current user's subscription status"""
        user = request.user
        
        try:
            subscription = NewsletterSubscription.objects.get(user=user)
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except NewsletterSubscription.DoesNotExist:
            return Response(
                {'subscribed': False},
                status=status.HTTP_200_OK
            )
