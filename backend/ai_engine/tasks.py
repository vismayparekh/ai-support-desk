from celery import shared_task
from django.db import transaction
from tickets.models import Ticket
from .ai_client import analyze_ticket

@shared_task
def process_ticket_ai(ticket_id: int):
    ticket = Ticket.objects.filter(id=ticket_id).first()
    if not ticket:
        return

    result = analyze_ticket(ticket.title, ticket.description)

    with transaction.atomic():
        Ticket.objects.filter(id=ticket_id).update(
            category=result["category"],
            priority=result["priority"],
            sentiment=result["sentiment"],
            ai_summary=result["summary"],
            ai_suggested_reply=result["suggested_reply"],
            ai_confidence=result["confidence"],
        )
