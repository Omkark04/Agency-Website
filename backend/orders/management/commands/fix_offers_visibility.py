# orders/management/commands/fix_offers_visibility.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from orders.models import Offer
from django.db.models import Q


class Command(BaseCommand):
    help = 'Check and fix offers visibility for public users'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n=== OFFERS VISIBILITY CHECK ===\n'))
        
        # Check all offers
        all_offers = Offer.objects.all()
        self.stdout.write(f'Total Offers: {all_offers.count()}')
        
        if not all_offers.exists():
            self.stdout.write(self.style.WARNING('No offers found in database!'))
            return
        
        # Show each offer's status
        self.stdout.write('\n--- All Offers ---')
        for offer in all_offers:
            self.stdout.write(f'\nID: {offer.id} | {offer.title}')
            self.stdout.write(f'  Active: {offer.is_active}')
            self.stdout.write(f'  Approved: {offer.is_approved}')
            self.stdout.write(f'  Valid From: {offer.valid_from}')
            self.stdout.write(f'  Valid To: {offer.valid_to}')
            self.stdout.write(f'  Currently Valid: {offer.is_currently_valid}')
        
        # Check public visibility
        now = timezone.now()
        public_offers = Offer.objects.filter(
            is_approved=True,
            is_active=True,
            valid_from__lte=now
        ).filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True))
        
        self.stdout.write(f'\n\n=== PUBLIC VISIBLE OFFERS ===')
        self.stdout.write(f'Count: {public_offers.count()}')
        
        if public_offers.exists():
            for offer in public_offers:
                self.stdout.write(f'  ✓ {offer.title}')
        else:
            self.stdout.write(self.style.WARNING('No offers visible to public!'))
            
            # Suggest fixes
            self.stdout.write('\n=== ISSUES FOUND ===')
            inactive = all_offers.filter(is_active=False)
            if inactive.exists():
                self.stdout.write(f'  • {inactive.count()} offers are INACTIVE')
                
            unapproved = all_offers.filter(is_approved=False)
            if unapproved.exists():
                self.stdout.write(f'  • {unapproved.count()} offers are UNAPPROVED')
                
            expired = all_offers.filter(valid_to__lt=now)
            if expired.exists():
                self.stdout.write(f'  • {expired.count()} offers are EXPIRED')
                
            not_started = all_offers.filter(valid_from__gt=now)
            if not_started.exists():
                self.stdout.write(f'  • {not_started.count()} offers have not started yet')
