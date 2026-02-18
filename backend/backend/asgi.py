import os
import django

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

import properties.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

application = ProtocolTypeRouter({
    # ✅ Normal HTTP requests
    "http": get_asgi_application(),

    # ✅ WebSocket requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            properties.routing.websocket_urlpatterns
        )
    ),
})
