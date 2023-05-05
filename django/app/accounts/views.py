from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import resolve_url
from django.views import generic
from django.contrib.auth.views import (
    LoginView, LogoutView, PasswordChangeView, PasswordChangeDoneView,
)
from django.urls import reverse_lazy
from .forms import (
    LoginForm, UserUpdateForm, PasswordChangeForm,
)

User = get_user_model()


class Login(LoginView):
    """Login view"""
    form_class = LoginForm
    template_name = 'accounts/login.html'


class Logout(LogoutView):
    """Logout view"""


class OnlyYouMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        user = self.request.user
        return user.pk == self.kwargs['pk'] or user.is_superuser


class UserDetail(OnlyYouMixin, generic.DetailView):
    model = User
    template_name = 'accounts/user_detail.html'


class UserUpdate(OnlyYouMixin, generic.UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = 'accounts/user_form.html'

    def get_success_url(self):
        return resolve_url('accounts:user_detail', pk=self.kwargs['pk'])


class PasswordChange(PasswordChangeView):
    """Password change"""
    form_class = PasswordChangeForm
    success_url = reverse_lazy('accounts:password_change_done')
    template_name = 'accounts/password_change.html'


class PasswordChangeDone(PasswordChangeDoneView):
    """Password change done"""
    template_name = 'accounts/password_change_done.html'
