from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Ticket, Comment

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "is_staff"]

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    assigned_to = UserMiniSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Ticket
        fields = [
            "id","title","description","status","category","priority",
            "sentiment","ai_summary","ai_suggested_reply","ai_confidence",
            "created_by","assigned_to","assigned_to_id",
            "created_at","updated_at","resolved_at",
        ]
        read_only_fields = [
            "sentiment","ai_summary","ai_suggested_reply","ai_confidence",
            "created_by","created_at","updated_at","resolved_at",
        ]

    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop("assigned_to_id", None)
        if assigned_to_id is not None:
            instance.assigned_to = User.objects.filter(id=assigned_to_id).first()
        return super().update(instance, validated_data)

class CommentSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id","ticket","author","message","created_at"]
        read_only_fields = ["author","created_at"]
