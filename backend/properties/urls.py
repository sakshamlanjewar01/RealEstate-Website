from django.urls import path
from .views import (
    AdminDashboardView,
    ContactMessageCreateView,
    PropertyListCreateView,
    PropertyDetailView,
    RegisterView,
    WishlistView,
    InquiryCreateView,
    BrokerInquiryListView,
    BrokerAnalyticsView,
    MeView,
    ReviewCreateView,
    ReviewListView,
    InquiryUpdateView,
    price_estimation,
)

from rest_framework_simplejwt.views import TokenObtainPairView


urlpatterns = [
    path("properties/", PropertyListCreateView.as_view()),
    path("properties/<int:pk>/", PropertyDetailView.as_view()),

    path("register/", RegisterView.as_view()),
    path("login/", TokenObtainPairView.as_view()),
    path("me/", MeView.as_view()),

    path("wishlist/", WishlistView.as_view()),

    path("inquiry/", InquiryCreateView.as_view()),
    path("broker/inquiries/", BrokerInquiryListView.as_view()),
    path("broker/inquiry/<int:pk>/", InquiryUpdateView.as_view()),

    path("reviews/", ReviewCreateView.as_view()),
    path("reviews/<int:property_id>/", ReviewListView.as_view()),

    path("broker/analytics/", BrokerAnalyticsView.as_view()),
    path("contact/", ContactMessageCreateView.as_view()),

    path("admin/dashboard/", AdminDashboardView.as_view()),

    path("ai/estimate-price/", price_estimation),

    
]
