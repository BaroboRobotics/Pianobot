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