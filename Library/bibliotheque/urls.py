from django.urls import path
from bibliotheque import views

urlpatterns = [
    path("", views.index , name='index'),
    path("login_register/", views.login_register , name='login_register'),
    path("quote/", views.quote, name="quote"),
    path("contact/", views.contact, name="contact"),
    path("subcribe/", views.subcribe, name='subcribe'),
    path("books/", views.books, name='books'),
    
]