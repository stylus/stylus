
/**
 * constructor.name polyfill
 */

 if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      var regex = /function\s([^(]{1,})\(/
        , match = regex.exec(this.toString());
      return match && match.length > 1 ? match[1].trim() : '';
    }
  });
}

/**
 * String.prototype.trimRight polyfill
 */

if (String.prototype.trimRight === undefined) {
  String.prototype.trimRight = function() {
    return String(this).replace(/\s+$/, '');
  };
}