# Generated by Django 4.2.5 on 2023-11-24 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_customuser_is_distributor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='is_distributor',
            field=models.BooleanField(default=False),
        ),
    ]
