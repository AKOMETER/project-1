from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
import random
import string
import json


def generate_referral_string():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


import datetime


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_distributor = models.BooleanField(default=False)
    basic_feature = models.BooleanField(default=True)
    standard_feature = models.BooleanField(default=False)
    advanced_feature = models.BooleanField(default=False)
    trial_user = models.BooleanField(default=True)
    register_date = models.DateField(blank=True, null=True)
    referral_string = models.CharField(
        max_length=8,
        unique=True,
        default=generate_referral_string,
    )
    parent_user = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL
    )
    first_name = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )
    last_name = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )
    phone = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )
    company_name = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )
    trial_plan = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )

    # def update_referral_string(self):
    #     self.referral_string = generate_referral_string()
    #     self.save()

    USERNAME_FIELD = "email"

    objects = CustomUserManager()

    groups = models.ManyToManyField("auth.Group", related_name="custom_users")
    user_permissions = models.ManyToManyField(
        "auth.Permission", related_name="custom_users"
    )


# @receiver(post_save, sender=CustomUser)
# def update_referral_string(sender, instance, created, **kwargs):
#     if created:
#         instance.update_referral_string()


class PhoneNumber(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    number = models.CharField(max_length=20)

    def __str__(self):
        return str(self.number)


class WhatsappCredential(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    phone_number_id = models.CharField(max_length=30)
    whatsapp_business_id = models.CharField(max_length=30)
    app_id = models.CharField(max_length=30, null=True, blank=True)
    permanent_access_token = models.CharField(max_length=500)

    def __str__(self):
        return str(self.user)


class Template(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    template_name = models.CharField(max_length=30)
    template_image = models.FileField(upload_to="template_image", null=True)

    def __str__(self):
        return str(self.template_name)

    # Template name and user should be unique
    class Meta:
        unique_together = ("user", "template_name")


class ScheduledAPICall(models.Model):
    api_data = models.TextField(null=True)
    scheduled_time = models.DateTimeField(null=True)


class ContactForm(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    code = models.CharField(max_length=10)
    phone = models.CharField(max_length=20)
    issue_description = models.TextField()


class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)


class PlanPurchase(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.CharField(max_length=100)
    started_date = models.DateField()
    image = models.ImageField(upload_to="plan_images/", blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.plan}"


class Blog(models.Model):
    link = models.CharField(max_length=100, unique=True)
    blog_content = models.TextField()
    published = models.BooleanField(default=False)


class ContactGroup(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone_numbers = models.TextField()

    def set_phone_numbers(self, phone_numbers_list):
        unique_numbers = list(set(phone_numbers_list))
        self.phone_numbers = ",".join(unique_numbers)

    def get_phone_numbers(self):
        return self.phone_numbers.split(",")

    def __str__(self):
        return self.name
