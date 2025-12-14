# orders/workflow.py
"""
Order workflow state machine with transition validation
"""

class OrderWorkflow:
    """
    Manages order status transitions and validates state changes
    """
    
    # Define allowed transitions: current_status -> [allowed_next_statuses]
    ALLOWED_TRANSITIONS = {
        "pending": ["approved"],
        "approved": ["estimation_sent", "in_progress"],
        "estimation_sent": ["in_progress", "pending"],  # Can go back if estimation rejected
        "in_progress": ["25_done"],
        "25_done": ["50_done", "in_progress"],  # Can go back if needed
        "50_done": ["75_done", "25_done"],
        "75_done": ["ready_for_delivery", "50_done"],
        "ready_for_delivery": ["delivered", "75_done"],  # Can go back for revisions
        "delivered": ["payment_pending", "ready_for_delivery"],  # Can go back if client requests changes
        "payment_pending": ["payment_done", "delivered"],
        "payment_done": ["closed"],
        "closed": [],  # Terminal state - no transitions allowed
    }
    
    # Status descriptions for UI
    STATUS_DESCRIPTIONS = {
        "pending": "Order is pending approval",
        "approved": "Order has been approved and is ready to start",
        "estimation_sent": "Estimation has been sent to client for review",
        "in_progress": "Work has started on this order",
        "25_done": "Order is 25% complete",
        "50_done": "Order is 50% complete",
        "75_done": "Order is 75% complete",
        "ready_for_delivery": "Order is ready for final delivery",
        "delivered": "Order has been delivered to client",
        "payment_pending": "Awaiting payment from client",
        "payment_done": "Payment has been received",
        "closed": "Order is closed and completed",
    }
    
    # Status colors for UI
    STATUS_COLORS = {
        "pending": "yellow",
        "approved": "blue",
        "estimation_sent": "purple",
        "in_progress": "indigo",
        "25_done": "cyan",
        "50_done": "teal",
        "75_done": "green",
        "ready_for_delivery": "lime",
        "delivered": "emerald",
        "payment_pending": "orange",
        "payment_done": "green",
        "closed": "gray",
    }
    
    @classmethod
    def validate_transition(cls, current_status, new_status):
        """
        Validate if transition from current_status to new_status is allowed
        
        Returns:
            tuple: (is_valid: bool, error_message: str)
        """
        if current_status == new_status:
            return False, "New status must be different from current status"
        
        if current_status not in cls.ALLOWED_TRANSITIONS:
            return False, f"Invalid current status: {current_status}"
        
        allowed_next = cls.ALLOWED_TRANSITIONS[current_status]
        
        if new_status not in allowed_next:
            return False, f"Cannot transition from '{current_status}' to '{new_status}'. Allowed: {', '.join(allowed_next)}"
        
        return True, ""
    
    @classmethod
    def get_next_allowed_statuses(cls, current_status):
        """
        Get list of allowed next statuses for current status
        
        Returns:
            list: List of allowed status values
        """
        return cls.ALLOWED_TRANSITIONS.get(current_status, [])
    
    @classmethod
    def get_status_info(cls, status):
        """
        Get complete information about a status
        
        Returns:
            dict: Status information including description and color
        """
        return {
            "value": status,
            "description": cls.STATUS_DESCRIPTIONS.get(status, ""),
            "color": cls.STATUS_COLORS.get(status, "gray"),
            "allowed_next": cls.get_next_allowed_statuses(status)
        }
    
    @classmethod
    def is_terminal_status(cls, status):
        """Check if status is terminal (no further transitions allowed)"""
        return len(cls.ALLOWED_TRANSITIONS.get(status, [])) == 0
    
    @classmethod
    def get_progress_percentage(cls, status):
        """Get progress percentage for a status"""
        progress_map = {
            "pending": 0,
            "approved": 5,
            "estimation_sent": 10,
            "in_progress": 20,
            "25_done": 25,
            "50_done": 50,
            "75_done": 75,
            "ready_for_delivery": 90,
            "delivered": 95,
            "payment_pending": 97,
            "payment_done": 99,
            "closed": 100,
        }
        return progress_map.get(status, 0)
