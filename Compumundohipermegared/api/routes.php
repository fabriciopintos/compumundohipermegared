<?php
// api/routes.php

$router->post('/login', 'AuthController@login');
$router->post('/logout', 'AuthController@logout');
$router->get('/me', 'AuthController@me');
$router->put('/me', 'AuthController@updateProfile');
$router->post('/me/password', 'AuthController@changePassword');
$router->delete('/me', 'AuthController@deleteAccount');
$router->post('/me/delete', 'AuthController@deleteAccount');
$router->get('/activities', 'DashboardController@activities');
$router->get('/classes', 'DashboardController@classes');
$router->post('/enrollments', 'DashboardController@enroll');
$router->delete('/enrollments', 'DashboardController@unenroll');
$router->post('/enrollments/cancel', 'DashboardController@unenroll');

$router->get('/admin/stats', 'AdminController@stats');
$router->get('/admin/users', 'AdminController@users');
$router->post('/admin/users', 'AdminController@createUser');
$router->delete('/admin/users/:id', 'AdminController@deleteUser');
$router->post('/admin/users/:id/delete', 'AdminController@deleteUser');

$router->get('/contacts', 'MessageController@contacts');
$router->get('/conversations', 'MessageController@conversations');
$router->post('/conversations', 'MessageController@start');
$router->get('/conversations/:id/messages', 'MessageController@messages');
$router->post('/conversations/:id/messages', 'MessageController@send');
$router->post('/conversations/:id/read', 'MessageController@read');

$router->get('/routines', 'RoutineController@index');
$router->get('/routines/students', 'RoutineController@students');
$router->post('/routines', 'RoutineController@create');
$router->put('/routines/:id', 'RoutineController@update');
$router->delete('/routines/:id', 'RoutineController@delete');
$router->post('/routines/:id/assign', 'RoutineController@assign');

$router->get('/notifications', 'NotificationController@index');
$router->post('/notifications/read-all', 'NotificationController@readAll');
$router->post('/notifications/:id/read', 'NotificationController@read');
