from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Ticket",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("status", models.CharField(choices=[("OPEN", "Open"), ("IN_PROGRESS", "In Progress"), ("RESOLVED", "Resolved")], default="OPEN", max_length=20)),
                ("category", models.CharField(choices=[("BILLING", "Billing"), ("LOGIN", "Login"), ("TECH", "Technical"), ("FEATURE", "Feature Request"), ("OTHER", "Other")], default="OTHER", max_length=30)),
                ("priority", models.CharField(choices=[("LOW", "Low"), ("MEDIUM", "Medium"), ("HIGH", "High"), ("CRITICAL", "Critical")], default="MEDIUM", max_length=20)),
                ("sentiment", models.CharField(default="UNKNOWN", max_length=20)),
                ("ai_summary", models.TextField(blank=True, default="")),
                ("ai_suggested_reply", models.TextField(blank=True, default="")),
                ("ai_confidence", models.FloatField(default=0.0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("resolved_at", models.DateTimeField(blank=True, null=True)),
                ("assigned_to", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_tickets", to="auth.user")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="created_tickets", to="auth.user")),
            ],
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="auth.user")),
                ("ticket", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="tickets.ticket")),
            ],
        ),
    ]
