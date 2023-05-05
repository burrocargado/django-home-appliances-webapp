"""
ASGI config for hawebapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os
import django
from channels.layers import get_channel_layer
from channels.routing import get_default_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hawebapp.settings')

django.setup(set_prefix=True)

application = get_default_application()

channel_layer = get_channel_layer()
