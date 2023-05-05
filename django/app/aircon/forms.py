import json

from django import forms
from django.forms import TextInput, Select
from django.utils.translation import gettext_lazy as _

from .models import TimerSchedule

POWER_CHOICES = (
    ("1", "ON"),
    ("0", "OFF"),
)

MODE_CHOICES = (
    ("A", _("Auto")),
    ("H", _("Heat")),
    ("D", _("Dry")),
    ("C", _("Cool")),
    ("F", _("Fan")),
)

FAN_CHOICES = (
    ("A", _("Auto")),
    ("L", _("Low")),
    ("M", _("Med")),
    ("H", _("High")),
)

TEMP_CHOICES = (
    (29, "29"),
    (28, "28"),
    (27, "27"),
    (26, "26"),
    (25, "25"),
    (24, "24"),
    (23, "23"),
    (22, "22"),
    (21, "21"),
    (20, "20"),
    (19, "19"),
    (18, "18"),
)


class ScheduleForm(forms.Form):
    time = forms.TimeField(
        widget=TextInput(attrs={"type": "time"}), help_text=_("Select time")
    )
    set_power = forms.ChoiceField(
        choices=POWER_CHOICES, help_text=_("Power control")
    )
    set_mode = forms.ChoiceField(
        choices=MODE_CHOICES, help_text=_("Operation mode"), required=False
    )
    set_fan = forms.ChoiceField(
        choices=FAN_CHOICES, help_text=_("Air volume"), required=False
    )
    set_temp = forms.IntegerField(
        widget=Select(choices=TEMP_CHOICES),
        initial=24, help_text=_('Set temp'), required=False
    )

    required_css_class = "django_bootstrap5-req"

    # Set this to allow tests to work properly in Django 1.10+
    # More information, see issue #337
    use_required_attribute = False

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data

    def clean_set_fan(self):
        set_fan = self.cleaned_data.get('set_fan')
        set_mode = self.cleaned_data.get('set_mode')
        if set_fan == 'A' and set_mode == 'F':
            raise forms.ValidationError(_(
                "Air volume cannot be set to automatic "
                "when the operation mode is set to Fan."
            ))
        return set_fan

    def save(self):
        data = {}
        for k, v in self.cleaned_data.items():
            if v:
                data[k] = v
        time = data.pop('time')
        timer_schedule = TimerSchedule(
            time=time,
            settings=json.dumps(data)
        )
        timer_schedule.save()
        return timer_schedule
