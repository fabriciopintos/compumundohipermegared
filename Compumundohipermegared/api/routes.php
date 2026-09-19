<?php
// api/routes.php

$router->post('/login', 'AuthController@login');
$router->post('/logout', 'AuthController@logout');
$router->get('/me', 'AuthController@me');
$router->get('/activities', 'DashboardController@activities');
$router->get('/classes', 'DashboardController@classes');
$router->post('/enrollments', 'DashboardController@enroll');
$router->delete('/enrollments', 'DashboardController@unenroll');
$router->post('/enrollments/cancel', 'DashboardController@unenroll');

$router->get('/admin/stats', 'AdminController@stats');
$router->get('/admin/users', 'AdminController@users');
$router->post('/admin/users', 'AdminController@createUser');
$router->delete('/admin/users/:id', 'AdminController@deleteUser');

$router->get('/contacts', 'MessageController@contacts');
$router->get('/conversations', 'MessageController@conversations');
$router->post('/conversations', 'MessageController@start');
$router->get('/conversations/:id/messages', 'MessageController@messages');
$router->post('/conversations/:id/messages', 'MessageController@send');
$router->post('/conversations/:id/read', 'MessageController@read');
