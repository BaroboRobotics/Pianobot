/**
 * Created by Adam on 3/1/2015.
 */
var chapter1 = angular.module('chapter1', ['ngRoute', 'ui.bootstrap', 'hljs', 'ngSanitize']);

chapter1.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'pianobotController',
        templateUrl: 'views/pianobot.html'
    }).otherwise({ redirectTo: '/'});

}]);