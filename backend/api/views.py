from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer

def home(request):
    return render(request, "home.html")

def logout_view(request):
    logout(request)
    return redirect("/")

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]