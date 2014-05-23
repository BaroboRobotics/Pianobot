function PianobotCtrl ($scope) {
  $scope.melody = [];

  $scope.currentFrequency = 440;

  /* Click handler for piano keys. */
  $scope.playKey = function (event) {
    /* The piano keyboard is divided into octaves, groups of 12 keys. The click
     * handler is installed at the octave level, but the click is generated at
     * the key level. Therefore, event.target is the key element and
     * event.currentTarget is the octave element. */
    var pitch = event.target.dataset.pitch;
    var octaveNo = event.currentTarget.dataset.octave;
    var freq = oneDecimal(frequencyFromPitch(pitch, octaveNo));
    
    $scope.currentFrequency = freq;
    $scope.melody.push({timeStamp: event.timeStamp, frequency: freq});
  };
}
