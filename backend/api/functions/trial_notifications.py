from datetime import datetime, timedelta
from api.models import Notification
from django.utils import timezone

# create notification when logging in


def check_trial_period(user):
    today = timezone.now().date()
    trial_period = timedelta(days=14)
    plan_period = timedelta(days=30)

    five_days_from_trial_end = today + timedelta(days=5)
    ten_days_from_plan_period = today + timedelta(days=10)
    trial_start_threshold = today - trial_period

    if user.trial_user and user.register_date <= five_days_from_trial_end:
        remaining_days = (user.register_date + trial_period - today).days
        message = f"Your trial period is ending in {remaining_days} days! Upgrade to continue using the service."
        notification, created = Notification.objects.get_or_create(
            user=user, message=message
        )
        if not created:
            notification.message = message
            notification.save()
    elif not user.trial_user and user.register_date <= ten_days_from_plan_period:
        remaining_days = (user.register_date + plan_period - today).days
        message = f"Your plan is ending in {remaining_days} days! Upgrade to continue using the service."
        notification, created = Notification.objects.get_or_create(
            user=user, message=message
        )
        if not created:
            notification.message = message
            notification.save()

    elif not user.trial_user:
        message = "Your Trial is active. Enjoy the service!"
        notification_date_threshold = today - trial_period

        # Check if a similar notification already exists within the last 30 days
        if not Notification.objects.filter(
            user=user, message=message, created_at__gte=notification_date_threshold
        ).exists():
            Notification.objects.create(user=user, message=message)
    else:
        message = "Your subscription is active. Enjoy the service!"
        notification_date_threshold = today - plan_period

        # Check if a similar notification already exists within the last 30 days
        if not Notification.objects.filter(
            user=user, message=message, created_at__gte=notification_date_threshold
        ).exists():
            Notification.objects.create(user=user, message=message)
