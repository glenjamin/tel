module.exports = function() {
  "use strict";

  function tel(name, value) {

    var lazy = (typeof value === 'function');
    var async = lazy && value.length == 1;

    var is_realised, realised;

    Object.defineProperty(tel, name, {

      get: function() {
        if (async) {
          return !is_realised ? asyncRealise() : asyncCached();
        }
        if (!is_realised) {
          is_realised = true;
          realised = lazy ? value() : value;
        }
        return realised;
      },

      set: function(override) {
        realised = override;
        is_realised = true;
        async = false;
      },

      enumerable: true,
      configurable: true
    })

    function asyncRealise() {
      return function(callback) {
        value(function() {
          is_realised = true;
          realised = [this, arguments];
          callback.apply(this, arguments);
        })
      }
    }
    function asyncCached() {
      return function(callback) {
        process.nextTick(function() {
          callback.apply(realised[0], realised[1]);
        })
      }
    }

  }

  return tel;
}