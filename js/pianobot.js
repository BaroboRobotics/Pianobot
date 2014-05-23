function PianobotCtrl ($scope) {
  $scope.robotId = '';

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

  $scope.oneDecimal = oneDecimal;
  $scope.frequencyFromScientificPitch = frequencyFromScientificPitch;

  $scope.playNote = function () {
    robot = Linkbots.connect($scope.robotId);
    robot.buzzerFrequency(frequencyFromScientificPitch($scope.note.scientificPitch));
    setTimeout(function () {
      robot.buzzerFrequency(0);
    }, $scope.note.duration);
  };

  /* Mousedown handler for piano keys. Must be installed at the octave level. */
  $scope.strikeKey = function (event) {
    /* The piano keyboard is divided into octaves, groups of 12 keys. The click
     * handler is installed at the octave level, but the click is generated at
     * the key level. Therefore, event.target is the key element and
     * event.currentTarget is the octave element. */
    $scope.strike = {
      scientificPitch: {
        pitch: event.target.dataset.pitch,
        octave: event.currentTarget.dataset.octave
      },
      timeStamp: event.timeStamp
    };

    robot = Linkbots.connect($scope.robotId);
    robot.buzzerFrequency(frequencyFromScientificPitch($scope.strike.scientificPitch));
  };

  /* Mouseup handler for piano keys. Must be installed at the octave level. */
  $scope.muteKey = function (event) {
    if (!('scientificPitch' in $scope.strike)) {
      return;
    }

    robot = Linkbots.connect($scope.robotId);
    robot.buzzerFrequency(0);

    var scientificPitch = {
      pitch: event.target.dataset.pitch,
      octave: event.currentTarget.dataset.octave
    };

    /* The two objects contain different references, so direct comparison will
     * always fail. */
    if ($scope.strike.scientificPitch.pitch != scientificPitch.pitch ||
        $scope.strike.scientificPitch.octave != scientificPitch.octave) {
      return;
    }

    var duration = new Date(event.timeStamp) - new Date($scope.strike.timeStamp);
    $scope.note = { scientificPitch: scientificPitch, duration: duration };

    /* Don't need the strike information anymore. */
    $scope.strike = { };
  }

  /* Mouseenter handler for piano keys. Must be installed at the octave level. */
  $scope.cancelKey = function (event) {
    if (!('scientificPitch' in $scope.strike)) {
      return;
    }

    var scientificPitch = {
      pitch: event.target.dataset.pitch,
      octave: event.currentTarget.dataset.octave
    };

    /* If we left the key that is currently playing, stop playing it--we'll
     * never receive the mouseup event. */
    if ($scope.strike.scientificPitch.pitch != scientificPitch.pitch ||
        $scope.strike.scientificPitch.octave != scientificPitch.octave) {
      robot = Linkbots.connect($scope.robotId);
      robot.buzzerFrequency(0);
      $scope.strike = { };
    }
  }
}
