# Generated by Django 4.2.5 on 2023-11-04 08:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_whatsappcredential_permanent_access_token'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumber',
            name='number',
            field=models.CharField(max_length=20),
        ),
    ]
