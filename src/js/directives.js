/**
 * Created by Adam on 3/1/2015.
 */
/**
 * Created by Adam on 2/22/2015.
 */
chapter1.directive('contenteditable', ['$sce', function($sce) {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
            };

            // Listen for change events to enable binding
            element.on('blur change', function() {
                scope.$evalAsync(read);
            });
            read(); // initialize
            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if ( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }
                if (isNaN(html)) {
                    html = parseFloat(html.replace(/[^0-9\.]+/g, ''));
                    if (isNan(html)) {
                        html = 0;
                    }
                    ngModel.$setViewValue(html);
                    element.html(html);
                } else {
                    ngModel.$setViewValue(html);
                }
            }
        }
    };
}]).directive('modifiable', function() {
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
                        inputElement.focus();
                        inputElement.select();
                    }
                });
            }
        }
    };
});
