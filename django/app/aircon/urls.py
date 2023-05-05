from django.urls import path

from . import views

app_name = 'aircon'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('schedule/', views.ScheduleView.as_view(), name='schedule'),
    path(
        'schedule/control', views.ScheduleControl.as_view(), name='sch_control'
    ),
]
