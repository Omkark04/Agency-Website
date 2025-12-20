# utils/validators.py
"""
Custom validators for input validation and security
"""
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re
import bleach
import os


def validate_no_special_chars(value):
    """Prevent SQL injection attempts in text fields"""
    if not isinstance(value, str):
        return value
    
    dangerous_patterns = [
        r'--',  # SQL comment
        r';.*?(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)',  # SQL commands
        r'xp_',  # Extended stored procedures
        r'sp_',  # Stored procedures
        r'<script',  # XSS attempts
        r'javascript:',  # XSS attempts
        r'onerror=',  # XSS attempts
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError(
                f'Invalid input detected. Please remove special characters or SQL/script keywords.'
            )
    
    return value


def validate_file_size(file):
    """Limit file upload size to 10MB"""
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(
            f'File size cannot exceed 10MB. Current size: {file.size / (1024 * 1024):.2f}MB'
        )


def validate_file_extension(file):
    """Only allow specific file types"""
    allowed_extensions = [
        '.pdf', '.doc', '.docx',  # Documents
        '.jpg', '.jpeg', '.png', '.gif', '.webp',  # Images
        '.zip', '.rar',  # Archives
        '.txt', '.csv',  # Text files
    ]
    
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(
            f'File type "{ext}" is not allowed. Allowed types: {", ".join(allowed_extensions)}'
        )


def sanitize_html(value):
    """Remove dangerous HTML tags and attributes"""
    if not isinstance(value, str):
        return value
    
    allowed_tags = [
        'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ]
    
    allowed_attributes = {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title'],
    }
    
    return bleach.clean(
        value,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )


class PasswordComplexityValidator:
    """
    Validate password complexity requirements:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                "Password must contain at least one uppercase letter (A-Z).",
                code='password_no_upper',
            )
        
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                "Password must contain at least one lowercase letter (a-z).",
                code='password_no_lower',
            )
        
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                "Password must contain at least one digit (0-9).",
                code='password_no_digit',
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]', password):
            raise ValidationError(
                "Password must contain at least one special character (!@#$%^&* etc).",
                code='password_no_special',
            )
    
    def get_help_text(self):
        return (
            "Your password must contain at least one uppercase letter, "
            "one lowercase letter, one digit, and one special character."
        )


# Phone number validator
phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)


# Email validator (additional to Django's default)
def validate_business_email(email):
    """Prevent disposable email addresses"""
    disposable_domains = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ]
    
    domain = email.split('@')[-1].lower()
    if domain in disposable_domains:
        raise ValidationError(
            'Please use a valid business or personal email address.'
        )


def validate_url_safe(value):
    """Ensure URL-safe strings (for slugs, etc)"""
    if not re.match(r'^[a-zA-Z0-9_-]+$', value):
        raise ValidationError(
            'Only letters, numbers, hyphens, and underscores are allowed.'
        )
