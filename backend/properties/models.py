from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Amenity(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Property(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    PROPERTY_TYPE = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('plot', 'Plot'),
    ]

    PURPOSE_CHOICES = (
    ("buy", "Buy"),
    ("rent", "Rent"),
    )

    purpose = models.CharField(
    max_length=10,
    choices=PURPOSE_CHOICES,
    default="buy"
    )


    image = models.ImageField(upload_to="property_images/", null=True, blank=True)

    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    location = models.CharField(max_length=255, db_index=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_TYPE,
        db_index=True
    )

    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    area = models.FloatField()

    is_available = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    amenities = models.ManyToManyField(Amenity, blank=True)

    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(
                sum(r.rating for r in reviews) / reviews.count(),
                1
            )
        return 0

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="property_gallery/")


class PropertyView(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="views"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(default=timezone.now, db_index=True)


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'property')


class Inquiry(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    ]

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="inquiries"
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    broker_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class Review(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    rating = models.IntegerField()
    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("property", "user")


class BrokerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    agency_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    photo = models.ImageField(upload_to="broker_photos/", null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username
    
class ContactMessage(models.Model):

    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"


class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}"

