# orders/views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework import permissions as drf_permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone

from .models import Order, Offer
from .serializers import OrderSerializer, OfferSerializer

# Import your role-based permission helpers
from accounts.permissions import IsAdmin, IsTeamHead

# Simple permission class used for public read-only access
class AllowAnyReadOnly(drf_permissions.BasePermission):
    """
    Allows any user to perform safe methods (GET, HEAD, OPTIONS),
    while other methods require authentication (handled elsewhere).
    """
    def has_permission(self, request, view):
        if request.method in drf_permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class OfferObjectPermission(drf_permissions.BasePermission):
    """
    Object-level permission for Offers:
    - Admin (role == 'admin') may do anything.
    - Service head (role == 'service_head') may modify/delete offers they created.
    - Others cannot modify/delete.
    - Public read allowed.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE (GET) allowed to all (list/retrieve handled at view-level filtering)
        if request.method in drf_permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admins can do everything
        if getattr(user, 'role', '') == 'admin':
            return True

        # Service head can modify offers they created
        if getattr(user, 'role', '') == 'service_head' and obj.created_by_id == getattr(user, 'id', None):
            return True

        # Otherwise no
        return False


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [drf_permissions.IsAuthenticated]  # tune this as your project requires
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'service__department']


class OfferViewSet(viewsets.ModelViewSet):
    """
    OfferViewSet supports:
      - Public listing/retrieval of approved & active offers (no auth needed)
      - Authenticated create/update/delete for admin and service_head (with restrictions)
      - Admin-only approval action
      - Stats and current_deal actions
    """
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    parser_classes = [MultiPartParser, FormParser]

    # Default permission: allow public reads, authenticated writes
    permission_classes = [AllowAnyReadOnly]
    # Object-level permissions applied later
    # Note: we'll enforce role-based restrictions in perform_create / perform_update / destroy / approve

    def get_permissions(self):
        """
        Customize permission classes for specific actions.
        - list & retrieve: AllowAnyReadOnly (already covers)
        - stats & current_deal: AllowAny (public)
        - approve: IsAdmin only
        - create/update/destroy: authenticated (further restrictions enforced in object permission)
        """
        if self.action in ['approve']:
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [drf_permissions.IsAuthenticated, OfferObjectPermission]
        else:
            # list, retrieve, stats, current_deal - public read
            permission_classes = [AllowAnyReadOnly]
        return [perm() for perm in permission_classes]

    def get_queryset(self):
        """
        Public default: only approved, active and currently valid offers are returned.
        Admins (when authenticated) can view all offers (optionally filter).
        Query params:
          - is_active=true|false
          - is_featured=true|false
          - offer_type=<string>
          - service=<service_id> (filter by service)
          - show_expired=true|false (default false)
        """
        qs = Offer.objects.all()
        request = self.request

        # If user is admin, allow viewing everything (unless explicit filters applied)
        user = getattr(request, 'user', None)
        is_admin = bool(user and getattr(user, 'role', '') == 'admin')

        # Apply simple query param filters
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')

        offer_type = request.query_params.get('offer_type')
        if offer_type:
            qs = qs.filter(offer_type=offer_type)

        service_id = request.query_params.get('service')
        if service_id:
            qs = qs.filter(services__id=service_id)

        # By default hide unapproved offers for non-admins
        if not is_admin:
            qs = qs.filter(is_approved=True)

        # By default hide inactive offers for non-admins
        if not is_admin:
            qs = qs.filter(is_active=True)

        # Filter by validity dates unless show_expired param explicitly allows expired
        show_expired = request.query_params.get('show_expired')
        if show_expired is None or show_expired.lower() == 'false':
            now = timezone.now()
            qs = qs.filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True), valid_from__lte=now)

        # Distinct because of M2M joins
        return qs.distinct().order_by('-priority', '-created_at')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return summary stats:
        - total_offers
        - active_offers (approved + active + valid)
        - featured_offers
        - limited_time_offers
        - avg_discount (for active offers)
        """
        now = timezone.now()
        base_qs = Offer.objects.filter(is_approved=True, is_active=True, valid_from__lte=now).filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True))

        total = Offer.objects.count()
        active = base_qs.count()
        featured = base_qs.filter(is_featured=True).count()
        limited = base_qs.filter(offer_type='limited').count()

        # average discount (percentage)
        avg_discount = 0.0
        if base_qs.exists():
            total_pct = 0.0
            count = 0
            for o in base_qs:
                try:
                    total_pct += float(o.discount_percentage or 0)
                    count += 1
                except Exception:
                    pass
            if count > 0:
                avg_discount = total_pct / count

        return Response({
            "total_offers": total,
            "active_offers": active,
            "featured_offers": featured,
            "limited_time_offers": limited,
            "average_discount": round(float(avg_discount), 2),
        })

    @action(detail=False, methods=['get'])
    def current_deal(self, request):
        """
        Return a single current deal (featured prioritized). Public endpoint.
        """
        now = timezone.now()
        # pick featured active offer first
        deal = Offer.objects.filter(is_approved=True, is_active=True, offer_type='limited', valid_from__lte=now).filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True)).order_by('-priority', '-created_at').first()
        if not deal:
            deal = Offer.objects.filter(is_approved=True, is_active=True, valid_from__lte=now).filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True)).order_by('-priority', '-created_at').first()

        if deal:
            serializer = self.get_serializer(deal, context={'request': request})
            return Response(serializer.data)
        else:
            return Response({
                'title': 'No current deals',
                'subtitle': 'Check back soon for new offers!',
                'description': '',
                'discount_percentage': 0,
                'valid_until': None,
                'remaining_days': 0,
                'is_active': False,
                'features': []
            }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """
        Admin-only endpoint to approve an offer.
        Sets is_approved=True, approved_by=request.user, approved_at=now
        """
        offer = get_object_or_404(Offer, pk=pk)
        if offer.is_approved:
            return Response({'detail': 'Offer already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        offer.is_approved = True
        offer.approved_by = request.user
        offer.approved_at = timezone.now()
        offer.save()
        serializer = self.get_serializer(offer, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        """
        On create:
         - Set created_by to request.user (if authenticated)
         - Snapshot created_by_department where possible
         - Prevent client-side setting of is_approved (must be admin)
        """
        request = self.request
        data = serializer.validated_data if hasattr(serializer, 'validated_data') else {}

        # Prevent client-side approval
        if 'is_approved' in data:
            data.pop('is_approved', None)

        if request and getattr(request, 'user', None) and request.user.is_authenticated:
            # assign created_by
            creator = request.user
            # snapshot department if user has such relationship (try several common property names)
            dept = None
            if hasattr(creator, 'department'):
                dept = getattr(creator, 'department')
            else:
                # for service_head case, departments_managed may be available (many-to-many)
                try:
                    dm = creator.departments_managed.all()
                    if dm.exists():
                        dept = dm.first()
                except Exception:
                    dept = None

            serializer.save(created_by=creator, created_by_department=dept)
        else:
            # anonymous creation should not be allowed; raise error
            raise PermissionError("Authentication required to create offers.")

    def perform_update(self, serializer):
        """
        Protect that only admins can set is_approved / approved_by / approved_at through update.
        Service heads can update their own offers but cannot approve.
        """
        request = self.request
        incoming = getattr(serializer, 'validated_data', {})

        # If client attempted to set approval flags, remove them unless admin
        if 'is_approved' in incoming or 'approved_by' in incoming or 'approved_at' in incoming:
            user = getattr(request, 'user', None)
            if not (user and getattr(user, 'role', '') == 'admin'):
                # remove these fields so serializer doesn't set them
                incoming.pop('is_approved', None)
                incoming.pop('approved_by', None)
                incoming.pop('approved_at', None)

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """
        Only admins or the creator (service_head) may delete an offer.
        """
        offer = self.get_object()
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_403_FORBIDDEN)

        if getattr(user, 'role', '') == 'admin' or (getattr(user, 'role', '') == 'service_head' and offer.created_by_id == user.id):
            return super().destroy(request, *args, **kwargs)
        return Response({'detail': 'You do not have permission to delete this offer.'}, status=status.HTTP_403_FORBIDDEN)


# Service Form endpoint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from forms.models import ServiceForm
from forms.serializers import ServiceFormSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_service_form(request, service_id):
    """
    Get the active form for a specific service
    """
    try:
        form = ServiceForm.objects.get(
            service_id=service_id,
            is_active=True
        )
        serializer = ServiceFormSerializer(form)
        return Response(serializer.data)
    except ServiceForm.DoesNotExist:
        return Response(
            {'error': 'No active form found for this service'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
