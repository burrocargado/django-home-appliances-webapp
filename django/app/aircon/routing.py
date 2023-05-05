from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('aircon/', consumers.Consumer.as_asgi(), name='aircon-ws'),
]
urlpatterns = websocket_urlpatterns
