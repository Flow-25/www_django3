from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from editor.models import BackgroundImage, Route, RoutePoint

class AuthenticationTests(TestCase):
    def setUp(self):
        """Set up a test client and a test user."""
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def test_redirect_if_not_logged_in(self):
        """Test that unauthenticated users are redirected to the login page."""
        response = self.client.get(reverse('route_list'))
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/login/?next=/')

    def test_login_and_access_route_list(self):
        """Test that a logged-in user can access the route list."""
        self.client.login(username='testuser', password='testpassword')
        response = self.client.get(reverse('route_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'editor/route_list.html')

class RouteManagementTests(TestCase):
    def setUp(self):
        """Set up a test client, user, and initial route."""
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.bg_image = BackgroundImage.objects.create(image='test.jpg', name='Test Image')
        self.route = Route.objects.create(user=self.user, background=self.bg_image, name='Test Route')

    def test_create_route(self):
        """Test creating a new route."""
        response = self.client.post(reverse('route_create'), {'name': 'New Route', 'background': self.bg_image.id})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Route.objects.filter(name='New Route', user=self.user).exists())

    def test_delete_route(self):
        """Test deleting an existing route."""
        route_id = self.route.id
        response = self.client.post(reverse('route_delete', args=[route_id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Route.objects.filter(id=route_id).exists())

class RoutePointManagementTests(TestCase):
    def setUp(self):
        """Set up a test client, user, route, and initial route point."""
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
        self.bg_image = BackgroundImage.objects.create(image='test.jpg', name='Test Image')
        self.route = Route.objects.create(user=self.user, background=self.bg_image, name='Test Route')

    def test_add_route_point(self):
        """Test adding a new route point to a route."""
        response = self.client.post(reverse('add_point', args=[self.route.id]),
                                     {'order': 1, 'x': 10.0, 'y': 20.0})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(RoutePoint.objects.filter(route=self.route, x=10.0, y=20.0).exists())

    def test_delete_route_point(self):
        """Test deleting a route point from a route."""
        route_point = RoutePoint.objects.create(route=self.route, order=1, x=10.0, y=20.0)
        response = self.client.post(reverse('remove_point', args=[self.route.id, route_point.id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(RoutePoint.objects.filter(id=route_point.id).exists())