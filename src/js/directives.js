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
}]);
