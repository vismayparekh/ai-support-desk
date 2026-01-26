from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(username=validated_data["username"], password=validated_data["password"])

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        u = ser.save()
        return Response({"id": u.id, "username": u.username})

class MeView(APIView):
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "is_staff": u.is_staff})
