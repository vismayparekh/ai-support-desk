import json
import re
from django.conf import settings

def _fallback_ai(title: str, description: str):
    text = (title + " " + description).lower()

    category = "OTHER"
    if any(k in text for k in [
    "charge", "charged", "overcharged", "double charged", "billing",
    "refund", "refunded", "invoice", "payment", "paid",
    "card", "credit card", "debit card",
    "transaction", "amount deducted", "money deducted",
    "subscription", "plan", "pricing",
    "renewal", "renewed",
    "failed payment", "payment failed",
    "receipt", "tax", "fee"
]):
        category = "BILLING"
    elif any(k in text for k in [
    "login", "log in", "signin", "sign in", "sign-in",
    "password", "forgot password", "reset password",
    "otp", "one time password",
    "2fa", "two factor", "verification code",
    "authentication", "auth",
    "account locked", "locked out",
    "cannot login", "unable to login",
    "access denied", "session expired"
]):
        category = "LOGIN"
    elif any(k in text for k in [
    "bug", "issue", "error", "exception",
    "500", "502", "503", "504",
    "crash", "crashes", "crashed",
    "not working", "doesn't work", "does not work",
    "broken", "failure", "failed",
    "timeout", "timed out",
    "loading", "stuck", "hang", "freeze", "freezing",
    "slow", "lag", "latency",
    "page not loading", "blank page",
    "server down", "service unavailable",
    "api error", "backend error", "frontend issue"
]):
        category = "TECH"
    elif any(k in text for k in [
    "feature", "feature request",
    "request", "enhancement",
    "add", "support for",
    "can you add", "would be nice",
    "it would be helpful",
    "improvement", "improve",
    "new feature",
    "enable", "option",
    "export", "download",
    "dark mode", "theme",
    "integration", "api support"
]):
        category = "FEATURE"

    sentiment = "NEUTRAL"
    if any(k in text for k in ["angry", "worst", "terrible", "asap", "immediately", "hate"]):
        sentiment = "ANGRY"
    if any(k in text for k in ["thanks", "thank you", "love", "great"]):
        sentiment = "POSITIVE"

    priority = "MEDIUM"
    if any(k in text for k in ["asap", "urgent", "immediately", "critical", "down"]):
        priority = "HIGH"
    if any(k in text for k in ["security", "breach", "charged twice", "fraud"]):
        priority = "CRITICAL"

    summary = f"User reports: {title}."[:200]
    suggested = (
        "Thanks for reaching out. I’m looking into this now and will update you shortly. "
        "Could you share any screenshots or exact error messages if available?"
    )

    return {
        "category": category,
        "priority": priority,
        "sentiment": sentiment,
        "summary": summary,
        "suggested_reply": suggested,
        "confidence": 0.55,
    }

def _json_extract(text: str):
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None

def analyze_ticket(title: str, description: str):
    if not settings.OPENAI_API_KEY:
        return _fallback_ai(title, description)

    # OpenAI SDK reads OPENAI_API_KEY from env; we pass it explicitly too.
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    system = (
        "You are an AI support triage assistant. Return ONLY a JSON object with keys: "
        "category, priority, sentiment, summary, suggested_reply, confidence. "
        "category must be one of: BILLING, LOGIN, TECH, FEATURE, OTHER. "
        "priority must be one of: LOW, MEDIUM, HIGH, CRITICAL. "
        "sentiment must be one of: ANGRY, NEUTRAL, POSITIVE. "
        "confidence must be between 0 and 1."
    )

    user = (
        f"Ticket title: {title}\n\n"
        f"Ticket description: {description}\n\n"
        "Return ONLY JSON."
    )

    resp = client.responses.create(
        model=settings.OPENAI_MODEL,
        input=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )

    raw = getattr(resp, "output_text", "") or ""
    data = _json_extract(raw)
    if not isinstance(data, dict):
        return _fallback_ai(title, description)

    def pick(val, allowed, default):
        val = str(val or "").strip().upper()
        return val if val in allowed else default

    return {
        "category": pick(data.get("category"), {"BILLING","LOGIN","TECH","FEATURE","OTHER"}, "OTHER"),
        "priority": pick(data.get("priority"), {"LOW","MEDIUM","HIGH","CRITICAL"}, "MEDIUM"),
        "sentiment": pick(data.get("sentiment"), {"ANGRY","NEUTRAL","POSITIVE"}, "NEUTRAL"),
        "summary": str(data.get("summary") or "")[:800],
        "suggested_reply": str(data.get("suggested_reply") or "")[:2000],
        "confidence": float(data.get("confidence") or 0.6),
    }
