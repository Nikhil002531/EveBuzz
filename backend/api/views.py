from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer

def hello(request):
    return JsonResponse({'message': 'Hello from Django!'})


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer