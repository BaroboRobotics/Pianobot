/* Convert a scientific pitch to a frequency. The pitch is input as two
 * parameters: a pitch name ('c' for C, 'cs' for C#/Db, etc.), and an octave
 * number. */
function frequencyFromScientificPitch (scientificPitch) {
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
}

function oneDecimal (no) {
  return Math.round(no * 10) / 10;
}
