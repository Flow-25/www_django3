import json
from io import BytesIO
from PIL import Image, ImageDraw
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from .models import BackgroundImage, Route, RoutePoint
from .forms import RouteForm, RoutePointForm
from .serializers import RouteSerializer, RoutePointSerializer
def get_background_image_url(request):
    # Fetch the background image URL based on the name provided in the request
    bg_name = request.GET.get('name', None)
    try:
        bg_image = BackgroundImage.objects.get(name=bg_name)
        img_url = bg_image.image.url  # Assuming the image field is named 'image'
        return JsonResponse({'image_url': img_url})
    except BackgroundImage.DoesNotExist:
        return JsonResponse({'image_url': ''})



def register(request):
    # Handle user registration
    if request.method == 'POST':
        user_form = UserCreationForm(request.POST)
        if user_form.is_valid():
            created_user = user_form.save()
            auth_login(request, created_user)  # Log in the newly created user
            return redirect('route_list')
    else:
        user_form = UserCreationForm()  # Display an empty registration form
    return render(request, 'registration/register.html', {'form': user_form})


@login_required
def route_list(request):
    # Fetch all background images
    bg_images = BackgroundImage.objects.all()
    # Get routes for the logged-in user
    user_routes_queryset = Route.objects.filter(user=request.user).order_by('id')

    # Handle pagination
    current_page = request.GET.get('page')
    pag_instance = Paginator(user_routes_queryset, 5)  # Paginate with 5 routes per page
    pag_routes = pag_instance.get_page(current_page)

    # Render the route list template
    return render(request, 'editor/route_list.html', {'background_images': bg_images, 'trasy': pag_routes})


@login_required
def route_create(request):
    # Handle route creation
    if request.method == 'POST':
        route_form = RouteForm(request.POST)
        if route_form.is_valid():
            new_route = route_form.save(commit=False)
            new_route.user = request.user  # Assign the logged-in user to the route
            new_route.save()
            return redirect('route_detail', route_id=new_route.id)
    else:
        route_form = RouteForm()  # Display an empty form for route creation

    # Fetch all background images for the dropdown
    bg_images = BackgroundImage.objects.all()
    bg_image_urls = {str(bg.id): bg.image.url for bg in bg_images}
    return render(
        request,
        'editor/route_form.html',
        {
            'form': route_form,
            'background_image_urls': bg_image_urls,  # Pass image URLs to the template
        }
    )

@login_required
def route_detail(request, route_id):
    # Fetch the specific route for the logged-in user
    selected_route = get_object_or_404(Route, id=route_id, user=request.user)
    # Get all points for the route, ordered by their sequence
    route_points = list(RoutePoint.objects.filter(route=selected_route).order_by('order').values('id', 'x', 'y'))
    point_form = RoutePointForm()
    bg_image_url = ''

    # Check if the route has a background image
    if selected_route.background and selected_route.background.image:
        bg_image_url = selected_route.background.image.url  # Use relative URL

    # Prepare context for rendering the detail page
    context = {
        'route': selected_route,
        'points': route_points,
        'point_form': point_form,
        'background_image_url': bg_image_url,
    }

    return render(request, 'editor/route_detail.html', context)


@login_required
def add_point(request, route_id):
    # Add a new point to the route
    selected_route = get_object_or_404(Route, id=route_id, user=request.user)
    if request.method == 'POST':
        point_form = RoutePointForm(request.POST)
        if point_form.is_valid():
            new_point = point_form.save(commit=False)
            new_point.route = selected_route
            new_point.order = selected_route.points.count() + 1  # Set the order of the new point
            new_point.save()
    return redirect('route_detail', route_id=selected_route.id)




@login_required
def remove_point(request, route_id, point_id):
    # Delete a point from the route
    route = get_object_or_404(Route, id=route_id, user=request.user)
    point = get_object_or_404(RoutePoint, id=point_id, route=route)
    point.delete()

    # Reorder the remaining points
    points = RoutePoint.objects.filter(route=route).order_by('order')
    for i, p in enumerate(points):
        p.order = i
        p.save()

    return redirect('route_detail', route_id=route.id)


# --- AJAX views ---
@login_required
@csrf_exempt
def add_point_ajax(request, route_id):
    # Add a new point to the route via AJAX
    if request.method == 'POST':
        route = get_object_or_404(Route, id=route_id, user=request.user)
        try:
            data = json.loads(request.body.decode('utf-8'))
            x = float(data.get('x'))
            y = float(data.get('y'))

            if x is not None and y is not None:
                point = RoutePoint.objects.create(route=route, x=x, y=y)
                points_data = list(route.points.values('x', 'y'))
                return JsonResponse({'status': 'success', 'points': points_data})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid x or y coordinates'}, status=400)
        except (ValueError, TypeError, KeyError) as e:
            return JsonResponse({'status': 'error', 'message': f'Invalid data: {e}'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def move_point_ajax(request, route_id):
    # Move a point in the route via AJAX
    if request.method == 'POST':
        route = get_object_or_404(Route, id=route_id, user=request.user)
        try:
            data = json.loads(request.body)
            idx = int(data['idx'])
            x = float(data['x'])
            y = float(data['y'])

            point = route.points.all()[idx]
            point.x = x
            point.y = y
            point.save()
            points = list(route.points.values('x', 'y'))
            return JsonResponse({'points': points})
        except (ValueError, IndexError, KeyError) as e:
            return JsonResponse({'status': 'error', 'message': f'Invalid data: {e}'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
@login_required
@csrf_exempt
def change_points_order_ajax(request, route_id):
    # Reorder points in a route via AJAX
    if request.method == 'POST':
        route = get_object_or_404(Route, id=route_id, user=request.user)
        data = json.loads(request.body)  # Parse the JSON data from the request
        order = data['order']  # Get the new order of points
        for new_order, idx in enumerate(order, 1):
            point = route.points.all()[idx]  # Fetch the point by index
            point.order = new_order  # Update the order
            point.save()  # Save the changes
        # Return the updated list of points
        points = list(route.points.order_by('order').values('x', 'y'))
        return JsonResponse({'points': points})


@login_required
@csrf_exempt
def save_points_ajax(request, route_id):
    # Save points for a route via AJAX
    if request.method == 'POST':
        route = get_object_or_404(Route, id=route_id, user=request.user)
        data = json.loads(request.body)  # Parse the JSON data from the request
        points_data = data.get('points', [])  # Get the list of points from the request

        # Fetch existing points to determine the maximum order
        existing_points = list(RoutePoint.objects.filter(route=route).order_by('order'))
        max_order = existing_points[-1].order + 1 if existing_points else 0

        frontend_ids = set()  # Track IDs of points sent from the frontend
        for i, point_data in enumerate(points_data):
            point_id = point_data.get('id')
            if point_id:
                # Update existing point
                point = get_object_or_404(RoutePoint, id=point_id, route=route)
                point.x = point_data['x']
                point.y = point_data['y']
                point.order = i
                point.save()
                frontend_ids.add(point_id)
            else:
                # Create a new point
                new_point = RoutePoint.objects.create(
                    route=route,
                    x=point_data['x'],
                    y=point_data['y'],
                    order=max_order + i
                )
                frontend_ids.add(new_point.id)

        # Delete points in the database that are not in the frontend list
        RoutePoint.objects.filter(route=route).exclude(id__in=frontend_ids).delete()

        # Return the updated list of points
        points = list(RoutePoint.objects.filter(route=route).order_by('order').values('id', 'x', 'y'))
        return JsonResponse({'status': 'success', 'points': points})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@login_required
def get_points_ajax(request, route_id):
    # Fetch all points for a route via AJAX
    route = get_object_or_404(Route, id=route_id, user=request.user)
    points = list(RoutePoint.objects.filter(route=route).order_by('order').values('id', 'x', 'y'))
    return JsonResponse({'points': points})


@staff_member_required
def admin_route_image(request, route_id):
    # Generate an image of the route with its points
    route = get_object_or_404(Route, id=route_id)
    points = RoutePoint.objects.filter(route=route).order_by('order')

    canvas_width = 1200
    canvas_height = 900

    # Create a blank canvas
    image = Image.new('RGB', (canvas_width, canvas_height), 'white')
    draw = ImageDraw.Draw(image)

    # Draw the background image if it exists
    if route.background and route.background.image:
        try:
            bg_image = Image.open(route.background.image.path).convert('RGB')
            bg_image = bg_image.resize((canvas_width, canvas_height), Image.LANCZOS)
            image.paste(bg_image, (0, 0))
        except Exception as e:
            print(f"Error processing background image for route {route.id}: {e}")

    # Draw the route points and lines connecting them
    route_points = [(int(p.x), int(p.y)) for p in points]
    if len(route_points) > 1:
        draw.line(route_points, fill='red', width=2)
        draw.line([route_points[-1], route_points[0]], fill='red', width=2)
    for x, y in route_points:
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill='blue')

    # Save the image to a buffer and return it as a response
    buffer = BytesIO()
    image.save(buffer, 'PNG')
    buffer.seek(0)
    return HttpResponse(buffer.read(), content_type='image/png')


class RouteViewSet(viewsets.ModelViewSet):
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fetch routes for the logged-in user
        user_routes = Route.objects.filter(user=self.request.user)
        return user_routes

    def perform_create(self, serializer):
        # Assign the logged-in user to the new route
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='punkty')
    def punkty(self, request, pk=None):
        # Handle points for a specific route
        selected_route = self.get_object()
        if request.method == 'GET':
            # Fetch all points for the route
            route_points = RoutePoint.objects.filter(route=selected_route).order_by('order')
            serialized_points = RoutePointSerializer(route_points, many=True).data
            return Response(serialized_points)
        elif request.method == 'POST':
            # Add a new point to the route
            point_serializer = RoutePointSerializer(data=request.data)
            if point_serializer.is_valid():
                point_serializer.save(route=selected_route)
                return Response(point_serializer.data, status=status.HTTP_201_CREATED)
            return Response(point_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoutePointViewSet(viewsets.ModelViewSet):
    serializer_class = RoutePointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fetch points for routes owned by the logged-in user
        return RoutePoint.objects.filter(route__user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Ensure the user owns the point before deleting it
        point = self.get_object()
        if point.route.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@login_required
def delete_route(request, route_id):
    # Delete a route owned by the logged-in user
    route = get_object_or_404(Route, id=route_id, user=request.user)
    route.delete()
    return redirect('route_list')