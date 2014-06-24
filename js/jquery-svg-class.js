/* jQuery's addClass/removeClass/hasClass doesn't work right with SVG elements.
 * Roll our own. */

(function ($) {
  $.fn.addClassSvg = function (klass) {
    if (typeof this.attr("class") != undefined) {
      return this.attr("class", this.attr("class") + " " + klass);
    }
    return this.attr("class", klass);
  };

  $.fn.removeClassSvg = function (klass) {
    if (typeof this.attr("class") != undefined) {
      var classes = this.attr("class").split(' ');
      return this.attr("class", classes.filter(function (e) {
        return e != klass;
      }).join(' '));
    }
    return this;
  };

  $.fn.hasClassSvg = function (klass) {
    if (typeof this.attr("class") != undefined) {
      return this.attr("class").split(' ').some(function (e) {
        return e == klass;
      });
    }
    return false;
  }
})(jQuery);
