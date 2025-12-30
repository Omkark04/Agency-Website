from django.core.management.base import BaseCommand
from orders.models import Order
from payments.models import Transaction, PaymentOrder
from django.db.models import Sum, F
from decimal import Decimal

class Command(BaseCommand):
    help = 'Recalculate total_paid for all orders based on successful transactions'

    def handle(self, *args, **options):
        self.stdout.write('Recalculating order totals...')
        
        orders = Order.objects.all()
        updated_count = 0
        
        for order in orders:
            # Calculate total from successful verified transactions
            # We use Transaction model as source of truth for "paid money"
            total_transaction_amount = Transaction.objects.filter(
                order=order,
                status='success',
                is_verified=True
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            # Also check paid PaymentOrders that might not have transactions (though they should)
            # This is a fallback but let's stick to transactions first as they represent actual money flow
            
            if total_transaction_amount != order.total_paid:
                self.stdout.write(f'Updating Order #{order.id}: {order.total_paid} -> {total_transaction_amount}')
                order.total_paid = total_transaction_amount
                order.save(update_fields=['total_paid'])
                updated_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} orders.'))
