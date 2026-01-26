from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from tickets.views import TicketViewSet, CommentViewSet
from analytics_app.views import AnalyticsSummaryView
from tickets.auth_views import RegisterView, MeView

router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="tickets")
router.register(r"comments", CommentViewSet, basename="comments")

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/me/", MeView.as_view(), name="me"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/", include(router.urls)),
    path("api/analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics_summary"),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
