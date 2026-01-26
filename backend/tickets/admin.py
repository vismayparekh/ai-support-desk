from django.contrib import admin
from .models import Ticket, Comment

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "category", "priority", "created_by", "assigned_to", "created_at")
    list_filter = ("status", "category", "priority")
    search_fields = ("title", "description", "created_by__username", "assigned_to__username")

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "ticket", "author", "created_at")
    search_fields = ("message", "author__username")
