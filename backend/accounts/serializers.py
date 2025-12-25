# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_active", "date_joined", "service", "department"]
        read_only_fields = ["is_active", "date_joined"]
    
    def get_department(self, obj):
        """Return department data if user has one"""
        if obj.department:
            return {
                "id": obj.department.id,
                "title": obj.department.title,
            }
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password], style={"input_type":"password"})
    password2 = serializers.CharField(write_only=True, required=True, style={"input_type":"password"})
    role = serializers.ChoiceField(choices=User._meta.get_field("role").choices, default="client")
    # Use IntegerField for department to avoid circular import issues
    department = serializers.IntegerField(required=False, allow_null=True)
    job_title = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "role", "phone", "department", "job_title"]
        extra_kwargs = {"email": {"required": True}, "username": {"required": True}}

    def validate_department(self, value):
        """Validate that the department exists"""
        if value is not None:
            from services.models import Department
            if not Department.objects.filter(id=value).exists():
                raise serializers.ValidationError("Invalid department ID")
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        
        # Handle department ID
        department_id = validated_data.pop("department", None)
        
        user = User(**validated_data)
        user.set_password(password)
        
        # Set department if provided
        if department_id is not None:
            from services.models import Department
            try:
                user.department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                pass  # Already validated, should not happen
        
        user.save()

        # Send welcome email - DISABLED for now (blocks on SMTP)
        # TODO: Move to Celery task for async sending
        # try:
        #     from django.core.mail import send_mail
        #     from django.conf import settings
        #     
        #     send_mail(
        #         subject='Welcome to UdyogWorks!',
        #         message=f'Hi {user.username},\\n\\nWelcome to UdyogWorks!...',
        #         from_email=settings.DEFAULT_FROM_EMAIL,
        #         recipient_list=[user.email],
        #         fail_silently=True,
        #     )
        # except Exception as e:
        #     print(f"Failed to send welcome email: {e}")

        return user

class LoginUserSerializer(serializers.ModelSerializer):
    """Lightweight serializer for login response - avoids circular references"""
    department_id = serializers.IntegerField(source='department.id', read_only=True, allow_null=True)
    department_title = serializers.CharField(source='department.title', read_only=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name", "phone", 
                  "department_id", "department_title", "avatar_url"]
        read_only_fields = fields

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Get user by email
        email = attrs.get("email") or attrs.get(self.username_field)
        try:
            user = User.objects.get(email=email)
            
            # Check if account is locked out
            if user.is_locked_out():
                lockout_time = user.lockout_until
                raise serializers.ValidationError({
                    "detail": f"Account is locked due to multiple failed login attempts. "
                             f"Try again after {lockout_time.strftime('%Y-%m-%d %H:%M:%S')}"
                })
        except User.DoesNotExist:
            pass  # Let the parent class handle invalid credentials
        
        try:
            data = super().validate(attrs)
            # Reset failed login attempts on successful login
            if hasattr(self, 'user') and self.user:
                self.user.reset_failed_login()
            # Use lightweight serializer to avoid circular references
            data.update({"user": LoginUserSerializer(self.user).data})
            return data
        except Exception as e:
            # Increment failed login attempts
            try:
                user = User.objects.get(email=email)
                user.increment_failed_login()
            except User.DoesNotExist:
                pass
            raise e

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, validators=[validate_password], style={"input_type":"password"})
    new_password2 = serializers.CharField(required=True, style={"input_type":"password"})

    def validate(self, attrs):
        if attrs.get("new_password") != attrs.get("new_password2"):
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

class AdminProfileSerializer(serializers.ModelSerializer):
    """Profile update serializer for Admin users"""
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "avatar_url"]
        read_only_fields = ["id", "username", "email"]

class ClientProfileSerializer(serializers.ModelSerializer):
    """Profile update serializer for Client users"""
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "company", "avatar_url"]
        read_only_fields = ["id", "username", "email"]

class ServiceHeadProfileSerializer(serializers.ModelSerializer):
    """Profile update serializer for Service Head users"""
    department_info = serializers.SerializerMethodField()
    service_info = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "avatar_url", 
                  "department", "department_info", "service", "service_info"]
        read_only_fields = ["id", "username", "email", "department", "service"]
    
    def get_department_info(self, obj):
        if obj.department:
            return {"id": obj.department.id, "title": obj.department.title}
        return None
    
    def get_service_info(self, obj):
        if obj.service:
            return {"id": obj.service.id, "title": obj.service.title}
        return None

class TeamMemberProfileSerializer(serializers.ModelSerializer):
    """Profile update serializer for Team Member users"""
    department_info = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "avatar_url", 
                  "department", "department_info", "job_title"]
        read_only_fields = ["id", "username", "email", "department", "job_title"]
    
    def get_department_info(self, obj):
        if obj.department:
            return {"id": obj.department.id, "title": obj.department.title}
        return None


# Team Head Serializers
class TeamMemberSerializer(serializers.ModelSerializer):
    '''Extended user serializer for team members with task counts and performance'''
    completed_tasks = serializers.SerializerMethodField()
    pending_tasks = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    performance = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    last_active = serializers.DateTimeField(source='last_login', read_only=True)
    join_date = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 
            'phone', 'avatar', 'status', 'join_date', 'last_active',
            'completed_tasks', 'pending_tasks', 'projects', 'performance'
        ]

    def get_completed_tasks(self, obj):
        return obj.assigned_tasks.filter(status='completed').count()

    def get_pending_tasks(self, obj):
        return obj.assigned_tasks.exclude(status='completed').count()

    def get_projects(self, obj):
        # Count unique orders from assigned tasks
        return obj.assigned_tasks.values('order').distinct().count()

    def get_performance(self, obj):
        # Calculate performance as percentage of completed tasks
        total = obj.assigned_tasks.count()
        if total == 0:
            return 100
        completed = obj.assigned_tasks.filter(status='completed').count()
        return round((completed / total) * 100)

    def get_status(self, obj):
        # Determine status based on last login
        if not obj.last_login:
            return 'offline'
        from django.utils import timezone
        from datetime import timedelta
        if timezone.now() - obj.last_login < timedelta(minutes=15):
            return 'online'
        elif timezone.now() - obj.last_login < timedelta(hours=24):
            return 'away'
        return 'offline'

    def get_avatar(self, obj):
        return obj.avatar_url or ''


class TeamMemberCreateSerializer(serializers.ModelSerializer):
    '''Serializer for creating team members'''
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
        }
    
    def create(self, validated_data):
        # Generate default password if not provided
        password = validated_data.pop('password', 'Welcome123!')
        
        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class TeamStatsSerializer(serializers.Serializer):
    '''Dashboard statistics for team head'''
    active_projects = serializers.IntegerField()
    tasks_assigned = serializers.IntegerField()
    tasks_completed = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    team_performance = serializers.FloatField()


class TeamPerformanceSerializer(serializers.Serializer):
    '''Team performance analytics'''
    productivity = serializers.FloatField()
    workload = serializers.FloatField()
    engagement = serializers.FloatField()
    weekly_trend = serializers.ListField(child=serializers.DictField())

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs.get("new_password") != attrs.get("new_password_confirm"):
            raise serializers.ValidationError({"new_password": "New passwords must match"})
        return attrs

class ChangeEmailSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    new_email = serializers.EmailField(required=True)
