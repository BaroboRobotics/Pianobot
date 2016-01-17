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
/**
 * Created by Adam on 3/1/2015.
 */
chapter1.controller('pianobotController', ['$scope', '$timeout', 'robotFactory', 'util', function($scope, $timeout, robotFactory, util) {
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        if ($scope.m.robot && $scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
    }
    function playNote() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.index++;
        if ($scope.m.index >= $scope.notes.length) {
            // Reset buzzer.
            $scope.m.robot.buzzerFrequency(0);
            $scope.m.index = -1;
            $scope.m.timeout = null;
            $scope.m.running = false;
            return;
        }
        var note = $scope.notes[$scope.m.index];
        if (note) {
            $scope.m.robot.buzzerFrequency(note.frequency);
            if (note.duration > 0) {
                $scope.m.timeout = $timeout(playNote, (note.duration * 1000));
            }
        }
    }
    $scope.m = {
        displayAllCode: false,
        robot: null,
        running: false,
        index: -1,
        timeout: null
    };
    /* Used to save state between strikeKey and muteKey handlers. */
    $scope.strike = { };

    /* Default note is A4 for half a second. */
    $scope.notes = [
        {
            frequency: 440,
            duration: 0.5
        }
    ];
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.deleteNote = function(i) {
        $scope.notes.splice(i, 1);
    };
    $scope.stop = function() {
        if ($scope.m.timeout && $scope.m.timeout !== null) {
            $timeout.cancel($scope.m.timeout);
        }
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        $scope.m.index = -1;
        $scope.m.timeout = null;
        $scope.m.running = false;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        if ($scope.m.timeout && $scope.m.timeout !== null) {
            $timeout.cancel($scope.m.timeout);
        }
        $scope.m.index = -1;
        $scope.m.timeout = null;
        $scope.m.running = true;
        playNote();
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        if ($scope.m.timeout && $scope.m.timeout !== null) {
            $timeout.cancel($scope.m.timeout);
        }
        robotFactory.unregister();
    };
    /* Mousedown handler for piano keys. Must be installed at the octave level. */
    $scope.strikeKey = function (event) {
        $scope.strike = util.strikeFromEvent(event);
        util.startPlaying(event.target);
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(util.frequencyFromScientificPitch($scope.strike.scientificPitch));
        }
    };

    /* Mouseup handler for piano keys. Must be installed at the octave level. */
    $scope.muteKey = function (event) {
        if (!($scope.strike instanceof util.Strike)) {
            return;
        }

        util.stopPlaying(event.target);

        /* Complete the current strike. */
        var note = util.noteFromStrike($scope.strike, event.timeStamp);
        note.frequency = util.oneDecimal(util.frequencyFromScientificPitch(note.scientificPitch));
        note.duration = note.duration / 1000;
        $scope.notes.push(note);

        /* Don't need the strike information anymore. */
        $scope.strike = { };
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
    };

    /* Mouseover handler for piano keys. Must be installed at the octave level. */
    $scope.swipeKey = function (event) {
        /* We only care about this event if there is an active strike: i.e., the
         * user must be swiping the piano keyboard. */
        if (!($scope.strike instanceof util.Strike)) {
            return;
        }

        /* relatedTarget is the key that was previously struck. */
        util.stopPlaying(event.relatedTarget);

        /* We changed keys. Complete the current strike. */
        var note = util.noteFromStrike($scope.strike, event.timeStamp);
        note.frequency = util.oneDecimal(util.frequencyFromScientificPitch(note.scientificPitch));
        note.duration = note.duration / 1000;
        $scope.notes.push(note);

        /* A wee hacky, but from here on out we can just treat this event as a
         * mousedown event. */
        $scope.strikeKey(event);
    };
    
    /* Mouseout handler for piano keys. Must be installed at the octave level. */
    $scope.leaveKey = function (event) {
        /* relatedTarget is the element the mouse is now over. */
        if (!util.isPianoKey(event.relatedTarget)) {
            /* ... while event.target is the key that was previously struck. We can
             * use muteKey() on this event to stop the buzzer and complete the note.
             */
            $scope.muteKey(event);
        }  
    };
    $scope.util = util;
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Pianobot');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Pianobot', url:'#/'}]);
    // 1/7 since it's the first of 7 lessons.
    $('.radial-progress').attr('data-progress', Math.floor((1 / 7) * 100));
}]).controller('lessonOneController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    $scope.m = {
        buzzer: 1046.5,
        displayAllCode: false,
        robot: null,
        running: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        var robot = $scope.m.robot;
        var buzzer = parseFloat($scope.m.buzzer);
        robot.buzzerFrequency(buzzer);
        $timeout(function () {
            robot.buzzerFrequency(0);
            $scope.m.running = false;
        }, 1500);
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 1');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 1', url:'#/lesson-one'}]);
    $('.radial-progress').attr('data-progress', Math.floor((2 / 7) * 100));
}]).controller('lessonTwoController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    var counter = 0;
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    function runLoop() {
        var buzzer = parseFloat($scope.m.buzzer);
        var sleep1 = parseFloat($scope.m.sleep1) * 1000;
        var sleep2 = parseFloat($scope.m.sleep2) * 1000;
        $scope.m.robot.buzzerFrequency(buzzer);
        $timeout(function() {
            $scope.m.robot.buzzerFrequency(0);
            $timeout(function() {
                counter--;
                if (counter > 0) {
                    runLoop();
                } else {
                    $scope.m.running = false;
                }
            }, sleep2);
        }, sleep1);
    }
    $scope.m = {
        buzzer: 1046.5,
        sleep1: 0.5,
        sleep2: 0.5,
        displayAllCode: false,
        robot: null,
        running: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        counter = 10;
        runLoop();
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 2');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 2', url:'#/lesson-two'}]);
    $('.radial-progress').attr('data-progress', Math.floor((3 / 7) * 100));
}]).controller('lessonThreeController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    var counter = 0;
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    function runLoop() {
        var buzzer = parseFloat($scope.m.buzzer);
        var sleep1 = parseFloat($scope.m.sleep1) * 1000;
        var sleep2 = parseFloat($scope.m.sleep2) * 1000;
        $scope.m.robot.buzzerFrequency(buzzer);
        $timeout(function() {
            $scope.m.robot.buzzerFrequency(0);
            $timeout(function() {
                counter--;
                if (counter > 0) {
                    runLoop();
                } else {
                    $scope.m.running = false;
                }
            }, sleep2);
        }, sleep1);
    }
    $scope.m = {
        buzzer: 1046.5,
        sleep1: 1,
        sleep2: 1,
        counter: 5,
        displayAllCode: false,
        robot: null,
        running: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        counter = Math.abs(parseInt($scope.m.counter, 10)) % 20;
        runLoop();
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 3');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 3', url:'#/lesson-three'}]);
    $('.radial-progress').attr('data-progress', Math.floor((4 / 7) * 100));
}]).controller('lessonFourController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    var counter = 0, sleep = 1000;
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    function runLoop() {
        if ($scope.m.stop === true) {
            $scope.m.robot.buzzerFrequency(0);
            $scope.m.running = false;
            return;
        }
        var kValues = $scope.m.kValues.map(function(num) { return parseInt(num, 10); });
        var buzzer = Math.pow(2, (counter - kValues[0]) / kValues[1]) * kValues[2];
        var decRange = parseInt($scope.m.decRange, 10);
        var endRange = parseInt($scope.m.endRange, 10);
        $scope.m.robot.buzzerFrequency(buzzer);
        $timeout(function() {
            $scope.m.robot.buzzerFrequency(0);
            if ($scope.m.stop === true) {
                $scope.m.robot.buzzerFrequency(0);
                $scope.m.running = false;
                return;
            }
            $timeout(function() {
                if ($scope.m.stop === true) {
                    $scope.m.robot.buzzerFrequency(0);
                    $scope.m.running = false;
                    return;
                }
                counter+=decRange;
                sleep -= 100;
                if (counter < endRange) {
                    runLoop();
                } else {
                    $scope.m.running = false;
                }
            }, sleep);
        }, sleep);
    }
    $scope.m = {
        startRange: 33,
        endRange: 53,
        decRange: 2,
        kValues: [49, 12, 440],
        buzzer: 1046.5,
        displayAllCode: false,
        robot: null,
        running: false,
        stop: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        $scope.m.stop = false;
        counter = Math.abs(parseInt($scope.m.startRange, 10)) % 20;
        sleep = 1000;
        runLoop();
    };
    $scope.stop = function() {
        $scope.m.stop = true;
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 4');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 4', url:'#/lesson-four'}]);
    $('.radial-progress').attr('data-progress', Math.floor((5 / 7) * 100));
}]).controller('lessonFiveController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    var index = 0;
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    function play() {
        if (index >= 8) {
            $scope.m.robot.buzzerFrequency(0);
            $scope.m.running = false;
        } else {
            var buzzer = parseFloat($scope.m.notes[index++]);
            $scope.m.robot.buzzerFrequency(buzzer);
            $timeout(play, 500);
        }
    }
    $scope.m = {
        notes: [1046.5, 1174.7, 1318.5, 1396.9, 1568.0, 1760.0, 1975.5, 2093.0, 0],
        displayAllCode: false,
        robot: null,
        running: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        index = 0;
        play();
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 5');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 5', url:'#/lesson-five'}]);
    $('.radial-progress').attr('data-progress', Math.floor((6 / 7) * 100));
}]).controller('lessonSixController', ['$scope', '$timeout', 'robotFactory', function($scope, $timeout, robotFactory) {
    var index = 0;
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    function play() {
        if (index >= 27) {
            $scope.m.robot.buzzerFrequency(0);
            $scope.m.running = false;
        } else {
            var buzzer = parseFloat($scope.m.notes[index]);
            var timer = parseFloat($scope.m.sleeps[index++]) * 1000;
            console.log(buzzer);
            $scope.m.robot.buzzerFrequency(buzzer);
            $timeout(play, timer);
        }
    }
    $scope.m = {
        notes: [1046.5, 0, 1046.5, 0, 1568, 0, 1568, 0, 1760, 0, 1568, 0, 1396.9, 0, 1396.9, 0, 1318.5, 0, 1318.5, 0, 1174.7, 0, 1174.7, 0, 1046.5],
        sleeps: [0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25],
        displayAllCode: false,
        robot: null,
        running: false
    };
    $scope.toggle = function() {
        $scope.m.displayAllCode = !$scope.m.displayAllCode;
    };
    $scope.run = function() {
        if ($scope.m.robot === null) {
            return;
        }
        $scope.m.running = true;
        index = 0;
        play();
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot !== null) {
            $scope.m.robot.buzzerFrequency(0);
        }
        robotFactory.unregister();
    };
    robotFactory.getRobots(setRobot, 1);
    Linkbots.setNavigationTitle('Lesson 6');
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Lesson 6', url:'#/lesson-six'}]);
    $('.radial-progress').attr('data-progress', Math.floor((7 / 7) * 100));
}]);
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

/**
 * Created by Adam on 3/1/2015.
 */
chapter1.factory('robotFactory', ['$interval', function($interval) {
    // Internal variables.
    var _intervalRef = null;
    var _num = 0;
    var _cb = function() {};
    var _robots = [];

    /* This function will fetch the robots once they are available. */
    function fetchRobots() {
        console.log('attempting robot acquisition');
        var acquired = Linkbots.acquire(_num);
        if (acquired.robots.length === _num) {
            _cb(acquired.robots);
            _robots = acquired.robots;
            $interval.cancel(_intervalRef);
            _intervalRef = null;
            return;
        } else if (acquired.robots.length > 0) {
            relinquish(acquired.robots);
        }
        if (_intervalRef === null) {
            _intervalRef = $interval(fetchRobots, 1000);
        }
    }
    
    function relinquish(robots) {
        if (robots.length > 0) {
            for (var i = 0; i < robots.length; i++) {
                Linkbots.relinquish(robots[i]);
            }
        }
    }
    
    /* If a change has occurred in the robot manager, reaquire the robots. */
    Linkbots.managerEvents.on('changed', function() {
        if (_robots.length > 0) {
            relinquish(_robots);
            _robots = [];
        }
        if (_num > 0) {
            fetchRobots();
        }
    });

    /**
     * Exported factory.
     */
    var robotFactory = {};

    robotFactory.getRobots = function(callback, number) {
        _cb = callback;
        _num = number;
        if (_robots.length == _num) {
            return _cb(_robots);
        } else if (_robots.length > 0) {
            relinquish(_robots);
            _robots = [];
            fetchRobots();
        } else {
            fetchRobots();
        }
    };
    robotFactory.unregister = function() {
        _cb = function() {};
        _num = 0;
        if (_intervalRef !== null) {
            $interval.cancel(_intervalRef);
            _intervalRef = null;
        }
    };
    return robotFactory;
}]).factory('util', function() {
    var utility = {};
    /* Convert a scientific pitch to a frequency. The pitch is input as two
     * parameters: a pitch name ('c' for C, 'cs' for C#/Db, etc.), and an octave
     * number. */
    utility.frequencyFromScientificPitch = function(scientificPitch) {
        var relativePitchNos = {
            "c" : 0,
            "cs": 1,
            "d" : 2,
            "ds": 3,
            "e" : 4,
            "f" : 5,
            "fs": 6,
            "g" : 7,
            "gs": 8,
            "a" : 9,
            "as": 10,
            "b" : 11
        };

        /* Where middle C's absolute pitch number is 40, A4=440Hz is 49 */
        var absolutePitchNo = scientificPitch.octave * 12 -
            8 + relativePitchNos[scientificPitch.pitch];
        return Math.pow(2, (absolutePitchNo - 49) / 12) * 440;
    };

    utility.oneDecimal = function(no) {
        return Math.round(no * 10) / 10;
    };
    utility.Strike = function(scientificPitch, timeStamp) {
        this.scientificPitch = scientificPitch;
        this.timeStamp = timeStamp;
    };

    utility.Note = function(scientificPitch, duration) {
        this.scientificPitch = scientificPitch;
        this.duration = duration;
    };

    utility.scientificPitchFromEvent = function(event) {
        /* The piano keyboard is divided into octaves, groups of 12 keys. The click
         * handler is installed at the octave level, but the click is generated at
         * the key level. Therefore, event.target is the key element and
         * event.currentTarget is the octave element. */
        if (event.target.dataset) {
            return {
                pitch: event.target.dataset.pitch,
                octave: event.currentTarget.dataset.octave
            };
        } else {
            return {
                pitch: event.target.attributes['data-pitch'].value,
                octave: event.currentTarget.dataset.octave
            };
        }
    };

    utility.strikeFromEvent = function(event) {
        return new utility.Strike(
            utility.scientificPitchFromEvent(event),
            event.timeStamp);
    };

    utility.noteFromStrike = function(strike, timeStamp) {
        var duration = new Date(timeStamp) - new Date(strike.timeStamp);
        return new utility.Note(
            strike.scientificPitch,
            duration);
    };

    utility.startPlaying = function(key) {
        $(key).addClassSvg("playing");
    };

    utility.stopPlaying = function(key) {
        $(key).removeClassSvg("playing");
    };

    utility.isPianoKey = function(object) {
        return $(object).hasClassSvg("piano-key");
    };
    return utility;
});
/* jQuery's addClass/removeClass/hasClass doesn't work right with SVG elements.
 * Roll our own. */

(function ($) {
  $.fn.addClassSvg = function (klass) {
    if (typeof this.attr("class") !== 'undefined') {
      return this.attr("class", this.attr("class") + " " + klass);
    }
    return this.attr("class", klass);
  };

  $.fn.removeClassSvg = function (klass) {
    if (typeof this.attr("class") !== 'undefined') {
      var classes = this.attr("class").split(' ');
      return this.attr("class", classes.filter(function (e) {
        return e != klass;
      }).join(' '));
    }
    return this;
  };

  $.fn.hasClassSvg = function (klass) {
    if (typeof this.attr("class") !== 'undefined') {
      return this.attr("class").split(' ').some(function (e) {
        return e == klass;
      });
    }
    return false;
  }
})(jQuery);
