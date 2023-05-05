import logging
import ipaddress

from django.shortcuts import render
from hawebapp import settings
from django.views.generic import View

from django.contrib.auth.mixins import AccessMixin

# Create your views here.

logger = logging.getLogger(__name__)


class LoginRequiredMixin(AccessMixin):

    def dispatch(self, request, *args, **kwargs):
        logger.debug(request.get_full_path())
        logger.debug(request.path)
        logger.debug(request.META)

        ip = ipaddress.ip_address(
            request.META.get('HTTP_X_REAL_IP') or request.META.get('REMOTE_ADDR')
        )
        cidrs = [ipaddress.ip_network(network) for network in settings.WHITELISTED_RANGES]
        if not request.user.is_authenticated and all([ip not in cidr for cidr in cidrs]):
            return self.handle_no_permission()

        return super().dispatch(request, *args, **kwargs)


class IndexView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'root/index.html')
