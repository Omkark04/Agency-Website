"""
Utility functions for accounts app.
"""

def get_user_department(user):
    """
    Get department for a user, checking both direct department field
    and departments_managed (reverse relationship from Department.team_head).
    
    This handles the dual relationship between User and Department:
    - user.department: Direct FK (for team members)
    - Department.team_head: FK pointing to User (creates departments_managed reverse relation)
    
    Returns: Department object or None
    """
    # First check direct department field
    if user.department:
        return user.department
    
    # Check departments_managed (for service heads assigned as team_head)
    try:
        managed_dept = user.departments_managed.first()
        if managed_dept:
            return managed_dept
    except AttributeError:
        pass
    
    return None
