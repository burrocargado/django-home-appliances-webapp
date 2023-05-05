# Generated by Django 4.1 on 2023-04-02 03:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('django_q', '0014_schedule_cluster'),
    ]

    operations = [
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datatype', models.CharField(max_length=10)),
                ('retain', models.BooleanField(default=False)),
                ('data', models.TextField()),
                ('time', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='TimerSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.TimeField()),
                ('settings', models.TextField()),
                ('schedule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='django_q.schedule')),
            ],
        ),
    ]
