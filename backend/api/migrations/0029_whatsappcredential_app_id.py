# Generated by Django 4.2.5 on 2024-04-02 07:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_rename_known_by_customuser_trial_plan'),
    ]

    operations = [
        migrations.AddField(
            model_name='whatsappcredential',
            name='app_id',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
