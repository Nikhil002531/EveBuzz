# api/urls.py
from django.urls import path, include
from .views import hello
from rest_framework.routers import DefaultRouter
from .views import EventViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='events')
urlpatterns = router.urls

urlpatterns = [
    path('hello/', hello),
    path('', include(router.urls)),  # <-- change this line
]
