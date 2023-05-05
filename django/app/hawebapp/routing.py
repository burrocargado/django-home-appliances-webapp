from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from root.consumers import MqttConsumer
from channels.auth import AuthMiddlewareStack
import aircon.routing
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            aircon.routing.websocket_urlpatterns
        )
    ),
    'channel': ChannelNameRouter(
        {
            "mqtt": MqttConsumer.as_asgi()
        }
    ),
})
