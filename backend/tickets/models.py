from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    # ✅ Change categories here (frontend will display whatever backend returns)
    CATEGORY_CHOICES = [
        ("BILLING", "Billing"),
        ("LOGIN", "Login"),
        ("TECH", "Technical"),
        ("FEATURE", "Feature Request"),
        ("OTHER", "Other"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="OTHER")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM")

    sentiment = models.CharField(max_length=20, default="UNKNOWN")
    ai_summary = models.TextField(blank=True, default="")
    ai_suggested_reply = models.TextField(blank=True, default="")
    ai_confidence = models.FloatField(default=0.0)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tickets")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tickets")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"#{self.id} {self.title}"

class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
