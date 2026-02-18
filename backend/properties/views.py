from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from django.utils.timezone import now
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings  # ✅ FIXED (was commented)
from .permissions import IsBrokerOrReadOnly
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai_price import predict_price
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Property,
    Wishlist,
    PropertyImage,
    Inquiry,
    PropertyView,
    Review,
    ContactMessage,
)

from .serializers import (
    ContactMessageSerializer,
    PropertySerializer,
    RegisterSerializer,
    WishlistSerializer,
    InquirySerializer,
    ReviewSerializer,
)


@api_view(["POST"])
def price_estimation(request):
    try:
        bedrooms = int(request.data.get("bedrooms", 0))
        bathrooms = int(request.data.get("bathrooms", 0))
        area = float(request.data.get("area", 0))
        location = request.data.get("location", "")

        predicted_price = predict_price(
            bedrooms,
            bathrooms,
            area,
            location
        )

        if predicted_price is None:
            return Response({"message": "Not enough data to train model yet."})

        return Response({"estimated_price": predicted_price})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# =====================================================
# PROPERTY LIST + CREATE
# =====================================================

class PropertyListCreateView(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsBrokerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]   # ✅ IMPORTANT

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Property.objects.all()

        search = self.request.query_params.get("search")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        property_type = self.request.query_params.get("type")
        bedrooms = self.request.query_params.get("bedrooms")
        ordering = self.request.query_params.get("ordering")
        my_properties = self.request.query_params.get("my_properties")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(location__icontains=search)
            )

        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        if property_type:
            queryset = queryset.filter(property_type=property_type)

        if bedrooms:
            if bedrooms == "4":
                queryset = queryset.filter(bedrooms__gte=4)
            else:
                queryset = queryset.filter(bedrooms=bedrooms)

        if my_properties == "true" and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)

        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    def get_serializer_context(self):
        return {"request": self.request}


# =====================================================
# PROPERTY DETAIL
# =====================================================

class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsBrokerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]   # ✅ IMPORTANT

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save()

        PropertyView.objects.create(
            property=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_serializer_context(self):
        return {"request": self.request}
    

# =====================================================
# AUTH + WISHLIST
# =====================================================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(
            items, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        property_id = request.data.get("property_id")
        Wishlist.objects.get_or_create(
            user=request.user,
            property_id=property_id
        )
        return Response({"message": "Added to wishlist"})

    def delete(self, request):
        property_id = request.data.get("property_id")
        Wishlist.objects.filter(
            user=request.user,
            property_id=property_id
        ).delete()
        return Response({"message": "Removed from wishlist"})


# =====================================================
# INQUIRY
# =====================================================

class InquiryCreateView(generics.CreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer

    def perform_create(self, serializer):
        inquiry = serializer.save()

        broker_email = inquiry.property.owner.email
        if broker_email:
            send_mail(
                subject=f"New Inquiry for {inquiry.property.title}",
                message=f"New inquiry from {inquiry.name}\n\n{inquiry.message}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[broker_email],
                fail_silently=True,
            )


class BrokerInquiryListView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Inquiry.objects.filter(
                property__owner=self.request.user
            ).order_by("-created_at")
        return Inquiry.objects.none()


class InquiryUpdateView(generics.UpdateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]


# =====================================================
# REVIEWS
# =====================================================

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        property_id = self.kwargs["property_id"]
        return Review.objects.filter(property_id=property_id)


# =====================================================
# ADVANCED BROKER ANALYTICS (UPGRADED)
# =====================================================

class BrokerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:
            return Response({"detail": "Not allowed"}, status=403)

        period = request.query_params.get("period", "monthly")

        properties = Property.objects.filter(owner=request.user)

        total_properties = properties.count()
        total_inquiries = Inquiry.objects.filter(
            property__owner=request.user
        ).count()
        total_views = PropertyView.objects.filter(
            property__owner=request.user
        ).count()

        conversion_rate = 0
        if total_views > 0:
            conversion_rate = round(
                (total_inquiries / total_views) * 100, 2
            )

        six_months_ago = now() - timedelta(days=180)

        # 🔁 Period Toggle
        if period == "daily":
            trunc_function = TruncDay
        elif period == "weekly":
            trunc_function = TruncWeek
        else:
            trunc_function = TruncMonth

        view_trend = (
            PropertyView.objects.filter(
                property__owner=request.user,
                viewed_at__gte=six_months_ago,
            )
            .annotate(period=trunc_function("viewed_at"))
            .values("period")
            .annotate(count=Count("id"))
            .order_by("period")
        )

        inquiry_trend = (
            Inquiry.objects.filter(
                property__owner=request.user,
                created_at__gte=six_months_ago,
            )
            .annotate(period=trunc_function("created_at"))
            .values("period")
            .annotate(count=Count("id"))
            .order_by("period")
        )

        # 🏆 Top Property
        top_property = (
            properties
            .annotate(view_count=Count("views"))
            .order_by("-view_count")
            .first()
        )

        top_property_data = None

        if top_property and top_property.view_count > 0:
            top_property_data = {
                "id": top_property.id,
                "title": top_property.title,
                "views": top_property.view_count,
                "inquiries": top_property.inquiries.count(),
            }

        return Response({
            "total_properties": total_properties,
            "total_inquiries": total_inquiries,
            "total_views": total_views,
            "conversion_rate": conversion_rate,
            "view_trend": list(view_trend),
            "inquiry_trend": list(inquiry_trend),
            "top_property": top_property_data,
            "period": period,
        })


# =====================================================
# ME
# =====================================================

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "is_broker": request.user.is_staff,
        })

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        contact = serializer.save()

        # Admin notification
        send_mail(
            subject=f"New Contact: {contact.subject}",
            message=f"""
New Contact Message

Name: {contact.name}
Email: {contact.email}
Phone: {contact.phone}

Message:
{contact.message}
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.DEFAULT_FROM_EMAIL],
            fail_silently=True,
        )

        # Auto-reply to user
        send_mail(
            subject="We received your message",
            message=f"""
Hi {contact.name},

Thank you for contacting DreamHomes.
Our team will get back to you shortly.

Best Regards,
DreamHomes Support
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[contact.email],
            fail_silently=True,
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_superuser:
            return Response({"detail": "Not allowed"}, status=403)

        total_users = User.objects.count()
        total_brokers = User.objects.filter(is_staff=True).count()
        total_properties = Property.objects.count()
        total_inquiries = Inquiry.objects.count()

        recent_contacts = ContactMessage.objects.order_by("-created_at")[:5]

        return Response({
            "total_users": total_users,
            "total_brokers": total_brokers,
            "total_properties": total_properties,
            "total_inquiries": total_inquiries,
            "recent_contacts": ContactMessageSerializer(recent_contacts, many=True).data,
        })
