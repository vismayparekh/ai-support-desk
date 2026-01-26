from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from tickets.models import Ticket

class AnalyticsSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total = Ticket.objects.count()

        by_status = list(Ticket.objects.values("status").annotate(count=Count("id")).order_by("status"))
        by_category = list(Ticket.objects.values("category").annotate(count=Count("id")).order_by("-count"))
        by_sentiment = list(Ticket.objects.values("sentiment").annotate(count=Count("id")).order_by("-count"))

        resolved = Ticket.objects.filter(status="RESOLVED", resolved_at__isnull=False)
        avg_resolution_seconds = None
        if resolved.exists():
            duration = ExpressionWrapper(F("resolved_at") - F("created_at"), output_field=DurationField())
            avg_duration = resolved.annotate(d=duration).aggregate(avg=Avg("d"))["avg"]
            if avg_duration:
                avg_resolution_seconds = avg_duration.total_seconds()

        return Response({
            "total": total,
            "by_status": by_status,
            "by_category": by_category,
            "by_sentiment": by_sentiment,
            "avg_resolution_seconds": avg_resolution_seconds,
        })
