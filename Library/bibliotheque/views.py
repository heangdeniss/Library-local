from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "index.html")

def login_register(request):
    return render(request, "login_register.html")

def quote(request):
    return render(request, "quote.html")

def contact(request):
    return render(request, "contact.html")

def subcribe(request): 
    return render(request, "subcribe.html")

def books(request):
    return render(request, "books.html")