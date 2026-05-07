from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_has_prep_access'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='resume_upload_limit',
            field=models.PositiveIntegerField(default=5),
        ),
        migrations.AddField(
            model_name='user',
            name='job_search_limit',
            field=models.PositiveIntegerField(default=15),
        ),
    ]
