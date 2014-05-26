function Strike (scientificPitch, timeStamp) {
  this.scientificPitch = scientificPitch;
  this.timeStamp = timeStamp;
}

function Note (scientificPitch, duration) {
  this.scientificPitch = scientificPitch;
  this.duration = duration;
}

function scientificPitchFromEvent (event) {
  /* The piano keyboard is divided into octaves, groups of 12 keys. The click
   * handler is installed at the octave level, but the click is generated at
   * the key level. Therefore, event.target is the key element and
   * event.currentTarget is the octave element. */
  return {
    pitch: event.target.dataset.pitch,
    octave: event.currentTarget.dataset.octave
  };
}

function strikeFromEvent (event) {
  return new Strike(
      scientificPitchFromEvent(event),
      event.timeStamp);
}

function noteFromStrike (strike, timeStamp) {
  var duration = new Date(timeStamp) - new Date(strike.timeStamp);
  return new Note(
      strike.scientificPitch,
      duration);
}

function startPlaying (key) {
  $(key).addClassSvg("playing");
}

function stopPlaying (key) {
  $(key).removeClassSvg("playing");
}

function isPianoKey (object) {
  return $(object).hasClassSvg("piano-key");
}

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
    $scope.strike = strikeFromEvent(event);

    startPlaying(event.target);

    robot = Linkbots.connect($scope.robotId);
    robot.buzzerFrequency(frequencyFromScientificPitch($scope.strike.scientificPitch));
  };

  /* Mouseup handler for piano keys. Must be installed at the octave level. */
  $scope.muteKey = function (event) {
    if (!($scope.strike instanceof Strike)) {
      return;
    }

    stopPlaying(event.target);

    /* Complete the current strike. */
    $scope.note = noteFromStrike($scope.strike, event.timeStamp);

    /* Don't need the strike information anymore. */
    $scope.strike = { };

    robot = Linkbots.connect($scope.robotId);
    robot.buzzerFrequency(0);
  }

  /* Mouseover handler for piano keys. Must be installed at the octave level. */
  $scope.swipeKey = function (event) {
    /* We only care about this event if there is an active strike: i.e., the
     * user must be swiping the piano keyboard. */
    if (!($scope.strike instanceof Strike)) {
      return;
    }

    stopPlaying(event.relatedTarget);

    /* We changed keys. Complete the current strike. */
    $scope.note = noteFromStrike($scope.strike, event.timeStamp);

    /* A wee hacky, but from here on out we can just treat this event as a
     * mousedown event. */
    $scope.strikeKey(event);
  }

  /* Mouseout handler for piano keys. Must be installed at the octave level. */
  $scope.leaveKey = function (event) {
    if (!isPianoKey(event.relatedTarget)) {
      $scope.muteKey(event);
    }
  };
}
