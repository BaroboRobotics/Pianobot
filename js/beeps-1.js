$( function() {

var noteDuration = 500;

$('.tryNow').click( function(obj) {
    var robotId = $('#robot-id').val();
    if (robotId) {
        $('.unknown-robot-id-comment').text('');
        $('.robot-id').text(robotId);
        var bot = Linkbots.connect(robotId);
        var freq = parseFloat($('#frequency').val());
        bot.buzzerFrequency(freq);

        setTimeout(function () {
          bot.buzzerFrequency(0);
        }, noteDuration);
    }
    else {
    }
});

$('.expand-program').click(function (event) {
    // Suppress addition of this navigation event to the browser's history, so
    // the Back button isn't screwed up.
    event.preventDefault();

    $('pre.hidden').slideToggle();

    // Flip the hider tab image
    $('img', this).replaceWith(imageToggle());
});

function oneDecimal (no) {
    return Math.round(no * 10) / 10;
}

function getFrequencyFromPianoKey (keyName, octaveNo) {
    var relativeKeyNos = {
        "piano-key-c" : 0,
        "piano-key-cs": 1,
        "piano-key-d" : 2,
        "piano-key-ds": 3,
        "piano-key-e" : 4,
        "piano-key-f" : 5,
        "piano-key-fs": 6,
        "piano-key-g" : 7,
        "piano-key-gs": 8,
        "piano-key-a" : 9,
        "piano-key-as": 10,
        "piano-key-b" : 11
    };

    /* Where middle C's absolute key number is 40, A4=440Hz is 49 */
    var absoluteKeyNo = octaveNo * 12 - 8 + relativeKeyNos[keyName];
    return Math.pow(2, (absoluteKeyNo - 49) / 12) * 440;
}

$(".piano-keys").load("images/PianoKeyboard.svg", function () {
    var octaveNo = parseInt($(this).attr('id'));

    /* The piano keys are all rect elements. */
    $('rect', this).click(function (event) {
        /* Color this key yellow while the note is playing. */
        var pianoKey = $(this);
        var currentColor = pianoKey.css("fill");
        setTimeout(function () {
            pianoKey.css("fill", currentColor);
        }, noteDuration);
        pianoKey.css("fill", "blue");

        freq = getFrequencyFromPianoKey(pianoKey.attr('id'), octaveNo);
        $('#frequency').val(oneDecimal(freq));
        $('.tryNow').click();
    });
});

});
