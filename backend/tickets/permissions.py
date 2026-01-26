from rest_framework.permissions import BasePermission

class IsStaffOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "created_by_id", None) == request.user.id
