from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == "GET":
        return Response(UserProfileSerializer(profile, context={'request': request}).data)

    data = request.data.copy()
    photo = data.get("photo")
    if isinstance(photo, str) and photo and not photo.startswith("data:"):
        # Preserve existing photo URL when saving unchanged profile data.
        data.pop("photo", None)

    serializer = UserProfileSerializer(profile, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def admin_update_user_profile(request, user_id):
    """Admin endpoint to update a user's profile (links only)"""
    if not request.user.is_superuser:
        return Response({"error": "Only admins can update other users' profiles."}, status=403)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
    profile, _ = UserProfile.objects.get_or_create(user=target_user)
    
    # Only allow updating links
    allowed_fields = {"website", "linkedin", "github", "leetcode"}
    data = {k: v for k, v in request.data.items() if k in allowed_fields}
    
    serializer = UserProfileSerializer(profile, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
