# Generated by Django 4.2.5 on 2023-11-13 09:27

import api.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_phonenumber_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='parent_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='customuser',
            name='referral_string',
            field=models.CharField(blank=True, default=api.models.generate_referral_string, max_length=8, null=True, unique=True),
        ),
    ]
