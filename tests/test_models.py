from django.test import TestCase
from django.contrib.auth import get_user_model
from editor.models import BackgroundImage, Route, RoutePoint

User = get_user_model()

class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.bg_image = BackgroundImage.objects.create(image='test.jpg', name='Test Image')

    def test_routepoint_creation(self):
        route = Route.objects.create(user=self.user, background=self.bg_image, name='Test Route')
        route_point = RoutePoint.objects.create(route=route, order=1, x=10, y=20)
        self.assertEqual(RoutePoint.objects.count(), 1)
        self.assertEqual(route_point.route, route)
        self.assertEqual(route_point.order, 1)
        self.assertEqual(route_point.x, 10)
        self.assertEqual(route_point.y, 20)

    def test_routepoint_ordering(self):
        route = Route.objects.create(user=self.user, background=self.bg_image, name='Test Route')
        RoutePoint.objects.create(route=route, order=2, x=30, y=40)
        RoutePoint.objects.create(route=route, order=1, x=10, y=20)
        points = list(RoutePoint.objects.filter(route=route))
        self.assertEqual(points[0].order, 1)
        self.assertEqual(points[1].order, 2)

    def test_user_creation_with_username(self):
        """Test that the created user has the correct username."""
        self.assertEqual(self.user.username, 'testuser')

    def test_backgroundimage_fields(self):
        """Test that the BackgroundImage model stores the correct fields."""
        self.assertEqual(self.bg_image.name, 'Test Image')
        self.assertEqual(self.bg_image.image, 'test.jpg')

    def test_route_creation_with_different_name(self):
        """Test creating a route with a different name."""
        route = Route.objects.create(user=self.user, background=self.bg_image, name='Another Test Route')
        self.assertEqual(route.name, 'Another Test Route')
        self.assertEqual(route.user, self.user)
        self.assertEqual(route.background, self.bg_image)

    def test_route_user_relation_multiple_routes(self):
        """Test that a user can have multiple routes."""
        route1 = Route.objects.create(user=self.user, background=self.bg_image, name='Route 1')
        route2 = Route.objects.create(user=self.user, background=self.bg_image, name='Route 2')
        self.assertIn(route1, self.user.route_set.all())
        self.assertIn(route2, self.user.route_set.all())
        self.assertEqual(self.user.route_set.count(), 2)

    def test_routepoint_creation_with_different_coordinates(self):
        """Test creating a RoutePoint with different coordinates."""
        route = Route.objects.create(user=self.user, background=self.bg_image, name='Test Route')
        route_point = RoutePoint.objects.create(route=route, order=1, x=50, y=60)
        self.assertEqual(route_point.x, 50)
        self.assertEqual(route_point.y, 60)
        self.assertEqual(route_point.order, 1)
        self.assertEqual(route_point.route, route)