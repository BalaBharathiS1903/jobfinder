from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_add_resource_links'),
    ]

    operations = [
        migrations.AddField(
            model_name='customcourse',
            name='course_link',
            field=models.URLField(blank=True, default=''),
        ),
    ]
