/* jQuery's addClass/removeClass doesn't work right with SVG elements. Roll our
 * own. */
(function ($) {
  $.fn.addSvgClass = function (newClass) {
    return this.attr("class", this.attr("class") + " " + newClass);
  };

  $.fn.removeSvgClass = function (oldClass) {
    var classes = this.attr("class").split(' ');
    return this.attr("class", classes.filter(function (e) {
      return e != oldClass;
    }).join(' '));
  };

})(jQuery);
