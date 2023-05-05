from django.db import models
from django_q.tasks import Schedule

# Create your models here.


class Status(models.Model):
    datatype = models.CharField(max_length=10)
    retain = models.BooleanField(default=False)
    data = models.TextField()
    time = models.DateTimeField()


class TimerSchedule(models.Model):
    time = models.TimeField()
    settings = models.TextField()
    schedule = models.ForeignKey(
        Schedule, on_delete=models.SET_NULL, null=True
    )
