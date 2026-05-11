from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("profile", "0002_add_photo_to_userprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="leetcode",
            field=models.URLField(blank=True),
        ),
    ]
