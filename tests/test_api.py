from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from rest_framework import status
from editor.models import BackgroundImage, Route, RoutePoint
from django.contrib.auth.models import User

class NewAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='newuser', password='newpassword')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.bg_image = BackgroundImage.objects.create(image='new_test.jpg', name='New Test Image')
        self.route = Route.objects.create(user=self.user, background=self.bg_image, name='New Test Route')

    def test_api_route_update(self):
        url = reverse('trasa-detail', args=[self.route.id])
        data = {'name': 'Updated Route Name'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.route.refresh_from_db()
        self.assertEqual(self.route.name, 'Updated Route Name')

    def test_api_route_point_update(self):
        route_point = RoutePoint.objects.create(route=self.route, order=1, x=1.0, y=1.0)
        url = reverse('punkt-detail', args=[route_point.id])
        data = {'x': 5.0, 'y': 5.0}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        route_point.refresh_from_db()
        self.assertEqual(route_point.x, 5.0)
        self.assertEqual(route_point.y, 5.0)

    def test_api_route_list_empty(self):
        Route.objects.all().delete()
        url = reverse('trasa-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_api_route_point_list(self):
        RoutePoint.objects.create(route=self.route, order=1, x=1.0, y=1.0)
        RoutePoint.objects.create(route=self.route, order=2, x=2.0, y=2.0)
        url = reverse('trasa-punkty', args=[self.route.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_api_route_point_invalid_create(self):
        url = reverse('trasa-punkty', args=[self.route.id])
        data = {'order': 'invalid', 'x': 'not_a_number', 'y': 'not_a_number'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RoutePoint.objects.filter(route=self.route).count(), 0)