/**
 * Created by Adam on 3/1/2015.
 */
chapter1.controller('pianobotController', ['$scope', '$timeout', 'robotFactory', 'util', function($scope, $timeout, robotFactory, util) {
    function setRobot(robots) {
        $scope.m.robot = robots[0];
        $scope.m.robot.buzzerFrequency(0);
    }
    $scope.m = {
        displayAllCode: false,
        robot: null,
        running: false
    };
    /* Used to save state between strikeKey and muteKey handlers. */
    $scope.strike = { };

    /* Default note is A4 for half a second. */
    $scope.note = {
        scientificPitch: {
            pitch: 'a',
            octave: 4
        },
        duration: 500
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
        robot.buzzerFrequency(util.frequencyFromScientificPitch($scope.note.scientificPitch));
        $timeout(function () {
            robot.buzzerFrequency(0);
            $scope.m.running = false;
        }, $scope.note.duration);
    };
    $scope.stopAcquisition = function() {
        if ($scope.m.robot === null) {
            $scope.m.robot.buzzerFrequency(0);
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
        $scope.note = util.noteFromStrike($scope.strike, event.timeStamp);

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
        $scope.note = util.noteFromStrike($scope.strike, event.timeStamp);

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
    Linkbots.setNavigationItems([{title:'Introductory Python', url:'/introductory-python/index.html'},
        {title:'Chapter 1', url:'#/'}, {title:'Pianobot', url:'#/'}]);
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
}]);