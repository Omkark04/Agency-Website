import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Offer
from django.utils import timezone

print("\n=== OFFERS DATABASE CHECK ===\n")
offers = Offer.objects.all()
print(f"Total Offers in DB: {offers.count()}\n")

if offers.exists():
    for offer in offers:
        print(f"ID: {offer.id}")
        print(f"  Title: {offer.title}")
        print(f"  Active: {offer.is_active}")
        print(f"  Approved: {offer.is_approved}")
        print(f"  Valid From: {offer.valid_from}")
        print(f"  Valid To: {offer.valid_to}")
        print(f"  Currently Valid: {offer.is_currently_valid}")
        print(f"  Created By: {offer.created_by}")
        print("-" * 50)
else:
    print("No offers found in database!")

print("\n=== PUBLIC VISIBLE OFFERS (Non-Admin View) ===\n")
now = timezone.now()
from django.db.models import Q
public_offers = Offer.objects.filter(
    is_approved=True,
    is_active=True,
    valid_from__lte=now
).filter(Q(valid_to__gte=now) | Q(valid_to__isnull=True))

print(f"Public Visible Count: {public_offers.count()}\n")
for offer in public_offers:
    print(f"  - {offer.title}")
