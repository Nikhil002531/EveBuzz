from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ("hackathon", "Hackathon"),
        ("cultural", "Cultural"),
        ("sports", "Sports"),
        ("competition", "Competition"),
        ("workshop", "Workshop"),
        ("seminar", "Seminar"),
        ("others", "Others"),
    ]

    title = models.CharField(max_length=100, default="")
    type = models.CharField(
        max_length=50, choices=EVENT_TYPE_CHOICES, default="hackathon"
    )
    other_type_name = models.CharField(
        max_length=100, blank=True, null=True, help_text="Specify if type is 'Others'"
    )
    image = models.ImageField(
        upload_to="events/images/", default="events/images/default.jpg"
    )
    description = models.TextField(default="")
    minTeamParticipants = models.IntegerField(default=0)
    maxTeamParticipants = models.IntegerField(default=1)
    location = models.CharField(max_length=200, default="")
    start_date = models.DateTimeField(default=None)
    end_date = models.DateTimeField(default=None)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    organizer = models.CharField(max_length=100, default="")
    contact_info = models.CharField(max_length=100, default="")
    registrationLink = models.URLField(default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
