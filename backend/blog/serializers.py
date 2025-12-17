from rest_framework import serializers
from .models import Blog
from accounts.models import User


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer for blog author information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class BlogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog list views"""
    author = AuthorSerializer(read_only=True)
    read_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'category',
            'featured_image', 'tags', 'is_published', 'is_featured',
            'published_at', 'created_at', 'read_time'
        ]
    
    def get_read_time(self, obj):
        """Calculate estimated read time based on content length"""
        words = len(obj.content.split())
        minutes = max(1, words // 200)  # Average reading speed: 200 words/min
        return f"{minutes} min read"


class BlogSerializer(serializers.ModelSerializer):
    """Full serializer with all fields including author details"""
    author = AuthorSerializer(read_only=True)
    read_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'author',
            'category', 'featured_image', 'gallery_images', 'tags',
            'is_published', 'is_featured', 'published_at',
            'created_at', 'updated_at', 'read_time'
        ]
        read_only_fields = ['slug', 'published_at', 'created_at', 'updated_at']
    
    def get_read_time(self, obj):
        """Calculate estimated read time based on content length"""
        words = len(obj.content.split())
        minutes = max(1, words // 200)
        return f"{minutes} min read"


class BlogCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for create and update operations"""
    
    class Meta:
        model = Blog
        fields = [
            'title', 'excerpt', 'content', 'category',
            'featured_image', 'gallery_images', 'tags',
            'is_published', 'is_featured'
        ]
    
    def validate_title(self, value):
        """Ensure title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()
    
    def validate_excerpt(self, value):
        """Ensure excerpt is not too long"""
        if len(value) > 500:
            raise serializers.ValidationError("Excerpt must be 500 characters or less")
        return value
    
    def validate_content(self, value):
        """Ensure content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        return value
