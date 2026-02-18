from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Property,
    Wishlist,
    PropertyImage,
    Inquiry,
    Review,
    ContactMessage,
    Amenity
)

class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class PropertySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    images = PropertyImageSerializer(many=True, read_only=True)

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    amenities = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Amenity.objects.all(),
        required=False
    )

    class Meta:
        model = Property
        fields = "__all__"
        read_only_fields = ["id", "owner", "views_count", "created_at"]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        amenities = validated_data.pop("amenities", [])

        property_instance = Property.objects.create(**validated_data)
        property_instance.amenities.set(amenities)

        for img in uploaded_images:
            PropertyImage.objects.create(property=property_instance, image=img)

        return property_instance

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        amenities = validated_data.pop("amenities", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if amenities is not None:
            instance.amenities.set(amenities)

        for img in uploaded_images:
            PropertyImage.objects.create(property=instance, image=img)

        return instance

# =========================
# OTHER SERIALIZERS
# =========================

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class WishlistSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "property"]


class InquirySerializer(serializers.ModelSerializer):
    property_title = serializers.ReadOnlyField(source="property.title")

    class Meta:
        model = Inquiry
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Review
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
