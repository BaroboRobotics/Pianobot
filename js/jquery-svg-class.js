/* jQuery's addClass/removeClass/hasClass doesn't work right with SVG elements.
 * Roll our own. */

(function ($) {
  $.fn.addClassSvg = function (klass) {
    return this.attr("class", this.attr("class") + " " + klass);
  };

  $.fn.removeClassSvg = function (klass) {
    var classes = this.attr("class").split(' ');
    return this.attr("class", classes.filter(function (e) {
      return e != klass;
    }).join(' '));
  };

  $.fn.hasClassSvg = function (klass) {
    return this.attr("class").split(' ').some(function (e) {
      return e == klass;
    });
  }

})(jQuery);
