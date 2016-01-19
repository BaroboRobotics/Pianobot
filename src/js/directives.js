/**
 * Created by Adam on 3/1/2015.
 */
/**
 * Created by Adam on 2/22/2015.
 */
chapter1.directive('modifiable', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
        transclude: true,
        template: '<span class="{{inputClass}} modifiable" ng-hide="modifying" ng-click="modifying = modifying ? false : true" ng-transclude></span><input type="{{inputType}}" ng-model="modData" ng-show="modifying" ng-blur="modifying = false" />',
        scope: {
            modData: '='
        },
        link: {
            pre: function(scope, element, attrs) {
                scope.inputType = attrs.number ? "number" : "text";
                scope.inputClass = attrs.number ? "hljs-number" : "hljs-string";
            },
            post: function(scope, element) {
                scope.$watch('modifying', function(newValue, oldValue) {
                   var inputElement;
                    if (newValue && !oldValue) {
                        inputElement = element.children()[1];
                        $timeout(function() {
                            inputElement.focus();
                            inputElement.select();
                        }, 10);
                    }
                });
            }
        }
    };
}]);
