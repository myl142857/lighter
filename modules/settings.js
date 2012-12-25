// Generated by CoffeeScript 1.3.3
(function() {

  module.exports = function() {
    var Settings;
    Settings = (function() {

      function Settings() {
        this.mongoose = require('mongoose');
        this.mongoose.connect('mongodb://localhost/lighter');
        this.marked = require('marked');
        this.marked.setOptions({
          highlight: function(code, lang) {
            var hl;
            hl = require('highlight.js');
            hl.tabReplace = '    ';
            return (hl.highlightAuto(code)).value;
          }
        });
      }

      Settings.prototype.marked = Settings.marked;

      Settings.prototype.mongoose = Settings.mongoose;

      Settings.prototype.url = 'http://localhost:3000/';

      return Settings;

    })();
    return new Settings();
  };

}).call(this);