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

var imageToggle = (function() {
  var images = [$("<img src='images/double-chevron-down.svg'></img>")
               ,$("<img src='images/double-chevron-up.svg'></img>")
               ];
  var currentIdx = 0;
  return function () {
    return images[(++currentIdx) % 2];
  };
}());

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
    try {
      var robot = Linkbots.connect($scope.robotId);
      robot.buzzerFrequency(frequencyFromScientificPitch($scope.note.scientificPitch));
      setTimeout(function () {
        robot.buzzerFrequency(0);
      }, $scope.note.duration);
    }
    catch (e) {
      console.log("need a bot");
    }
  };

  /* Mousedown handler for piano keys. Must be installed at the octave level. */
  $scope.strikeKey = function (event) {
    $scope.strike = strikeFromEvent(event);

    startPlaying(event.target);

    try {
      var robot = Linkbots.connect($scope.robotId);
      robot.buzzerFrequency(frequencyFromScientificPitch($scope.strike.scientificPitch));
    }
    catch (e) {
      console.log("need a bot");
    }
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

    try {
      var robot = Linkbots.connect($scope.robotId);
      robot.buzzerFrequency(0);
    }
    catch (e) {
      console.log("need a bot");
    }
  }

  /* Mouseover handler for piano keys. Must be installed at the octave level. */
  $scope.swipeKey = function (event) {
    /* We only care about this event if there is an active strike: i.e., the
     * user must be swiping the piano keyboard. */
    if (!($scope.strike instanceof Strike)) {
      return;
    }

    /* relatedTarget is the key that was previously struck. */
    stopPlaying(event.relatedTarget);

    /* We changed keys. Complete the current strike. */
    $scope.note = noteFromStrike($scope.strike, event.timeStamp);

    /* A wee hacky, but from here on out we can just treat this event as a
     * mousedown event. */
    $scope.strikeKey(event);
  }

  /* Mouseout handler for piano keys. Must be installed at the octave level. */
  $scope.leaveKey = function (event) {
    /* relatedTarget is the element the mouse is now over. */
    if (!isPianoKey(event.relatedTarget)) {
      /* ... while event.target is the key that was previously struck. We can
       * use muteKey() on this event to stop the buzzer and complete the note.
       */
      $scope.muteKey(event);
    }
  };

  $scope.checkRobotId = function () {
    var robotIdInput = $("#robot-id");
    robotIdInput.removeClass("error connected");
    if (4 == $scope.robotId.length) {
      try {
        var robot = Linkbots.connect($scope.robotId);
        robotIdInput.addClass("connected");
      }
      catch (e) {
        robotIdInput.addClass("error");
      }
    }
  };

  $scope.expandProgram = function (event) {
    event.preventDefault();
    var code = $("#hidden-code");
    if (code.hasClass("hidden")) {
      $("img", $(event.currentTarget)).replaceWith(imageToggle());
      code.hide();
      code.removeClass("hidden");
      code.slideDown("slow", function () {
      });
    }
    else {
      $("img", $(event.currentTarget)).replaceWith(imageToggle());
      code.slideUp("slow", function () {
        code.addClass("hidden");
        code.show();
      });
    }
  };
}
