import logging
import json
import ipaddress

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django_q.tasks import Schedule

from django.utils import timezone
from django.utils.timezone import make_aware

from django.utils.translation import gettext as _
from django.shortcuts import render, redirect
from django.views.generic import FormView, View
from django.urls import reverse_lazy, reverse
from .forms import ScheduleForm
from .models import TimerSchedule
from hawebapp import settings

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
        d = {'ws_url': reverse('aircon-ws', urlconf='aircon.routing')}
        return render(request, 'aircon/index.html', d)


def send_command(data):
    channel_layer = get_channel_layer()
    message = {'topic': 'aircon/control', 'payload': json.dumps(data)}
    logger.info('message: %s', message)
    async_to_sync(channel_layer.send)(
        'mqtt.pub', {'type': 'mqtt.pub', 'text': message}
    )


class ScheduleView(LoginRequiredMixin, FormView):
    template_name = "aircon/form_schedule.html"
    form_class = ScheduleForm
    success_url = reverse_lazy('aircon:schedule')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # pylint: disable=no-member
        q = TimerSchedule.objects.all().order_by('time')
        sched_list = []
        for item in q:
            data = json.loads(item.settings)
            if 'set_mode' not in data:
                data['set_mode'] = '-'
            if 'set_fan' not in data:
                data['set_fan'] = '-'
            if 'set_temp' not in data:
                data['set_temp'] = 0
            sched_list.append({
                'id': item.id,
                'time': item.time,
                'power': {'1': 'ON', '0': 'OFF'}[data['set_power']],
                'mode': {
                    'A': _('Auto'), 'H': _('Heat'), 'D': _('Dry'),
                    'C': _('Cool'), 'F': _('Fan'), '-': '-'
                }[data['set_mode']],
                'fan': {
                    'A': _('Auto'), 'H': _('High'),
                    'M': _('Med'), 'L': _('Low'), '-': '-'
                }[data['set_fan']],
                'temp': data['set_temp'] if data['set_temp'] > 0 else '-',
            })
        context['sched_list'] = sched_list
        return context

    def form_valid(self, form):
        data = form.cleaned_data
        logger.info('form data: %s', data)
        timer_schedule = form.save()
        data = json.loads(timer_schedule.settings)
        schedule_time = timer_schedule.time
        naive_time = timezone.datetime.combine(
            timezone.now().date(), schedule_time
        )
        aware_time = make_aware(naive_time)
        if aware_time < timezone.now():
            aware_time += timezone.timedelta(1)
        schedule = Schedule(
            func='aircon.views.send_command',
            args=data,
            schedule_type=Schedule.DAILY,
            next_run=aware_time
        )
        schedule.save()
        timer_schedule.schedule = schedule
        timer_schedule.save()

        return super().form_valid(form)


class ScheduleControl(LoginRequiredMixin, View):
    def get(self, _request):
        return redirect('../schedule/')

    def post(self, request):
        data = request.POST
        logger.info('post data: %s', data)
        if 'btn-sch-remove' in data:
            rmlist = request.POST.getlist('chk_rm')
            for id_ in rmlist:
                # pylint: disable=no-member
                try:
                    timer_schedule = TimerSchedule.objects.get(id=id_)
                except TimerSchedule.DoesNotExist:
                    pass
                else:
                    schedule = timer_schedule.schedule
                    if schedule is not None:
                        schedule.delete()
                    timer_schedule.delete()

        return redirect('../schedule/')
