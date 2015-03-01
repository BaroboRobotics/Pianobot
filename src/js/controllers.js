/**
 * Created by Adam on 3/1/2015.
 */
chapter1.controller('pianobotController', ['$scope', '$timeout', '$interval', 'robotFactory', 'util', function($scope, $timeout, $interval, robotFactory, util) {
    function setRobot(robots) {
        $scope.m.robot = robots[0];
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
}]).controller('lessonOneController', ['$scope', '$interval', 'robotFactory', function($scope, $interval, robotFactory) {
    
}]);