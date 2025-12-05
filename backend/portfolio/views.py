from django.shortcuts import render

from rest_framework import viewsets
from .models import PortfolioProject
from .serializers import PortfolioProjectSerializer

class PortfolioProjectViewSet(viewsets.ModelViewSet):
    queryset = PortfolioProject.objects.all()
    serializer_class = PortfolioProjectSerializer
