# Generated by Django 4.2.5 on 2024-02-22 14:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_alter_customuser_trial_used'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='trial_used',
            field=models.BooleanField(default=False),
        ),
    ]
