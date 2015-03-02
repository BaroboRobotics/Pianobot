/**
 * Created by Adam on 3/1/2015.
 */
var chapter1 = angular.module('chapter1', ['ngRoute', 'ui.bootstrap', 'hljs', 'ngSanitize']);

chapter1.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'pianobotController',
        templateUrl: 'views/pianobot.html'
    }).when('/lesson-one', {
        controller: 'lessonOneController',
        templateUrl: 'views/lesson-one.html'
    }).when('/lesson-two', {
        controller: 'lessonTwoController',
        templateUrl: 'views/lesson-two.html'
    }).when('/lesson-three', {
        controller: 'lessonThreeController',
        templateUrl: 'views/lesson-three.html'
    }).when('/lesson-four', {
        controller: 'lessonFourController',
        templateUrl: 'views/lesson-four.html'
    }).when('/lesson-five', {
        controller: 'lessonFiveController',
        templateUrl: 'views/lesson-five.html'
    }).when('/lesson-six', {
        controller: 'lessonSixController',
        templateUrl: 'views/lesson-six.html'
    }).otherwise({ redirectTo: '/'});

}]);