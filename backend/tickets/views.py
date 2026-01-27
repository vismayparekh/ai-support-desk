from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer
from .permissions import IsStaffOrOwner
from ai_engine.tasks import process_ticket_ai
from django.conf import settings
from .tasks import process_ticket_ai 
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsStaffOrOwner]

    def get_queryset(self):
        u = self.request.user
        if u.is_staff:
            return Ticket.objects.all().order_by("-created_at")
        return Ticket.objects.filter(created_by=u).order_by("-created_at")

    def perform_create(self, serializer):
        ticket = serializer.save(created_by=self.request.user)
        if getattr(settings, "AI_ASYNC", True):
            process_ticket_ai.delay(ticket.id)   # local async
        else:
            # production sync (no worker needed)
            try:
                process_ticket_ai(ticket.id)     # run immediately in same request
            except Exception:
                pass

    def perform_update(self, serializer):
        ticket = serializer.save()
        if ticket.status == "RESOLVED" and ticket.resolved_at is None:
            ticket.resolved_at = timezone.now()
            ticket.save(update_fields=["resolved_at"])

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        if not request.user.is_staff:
            return Response({"detail": "Only staff can assign tickets."}, status=status.HTTP_403_FORBIDDEN)
        ticket = self.get_object()
        assigned_to_id = request.data.get("assigned_to_id")
        ticket.assigned_to = User.objects.filter(id=assigned_to_id).first()
        ticket.save(update_fields=["assigned_to"])
        return Response(TicketSerializer(ticket).data)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        qs = Comment.objects.select_related("ticket", "author").all().order_by("-created_at")
        ticket_id = self.request.query_params.get("ticket")
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)
        if self.request.user.is_staff:
            return qs
        return qs.filter(ticket__created_by=self.request.user)

    def perform_create(self, serializer):
        ticket = serializer.validated_data["ticket"]
        if (not self.request.user.is_staff) and ticket.created_by_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only comment on your own tickets.")
        serializer.save(author=self.request.user)
