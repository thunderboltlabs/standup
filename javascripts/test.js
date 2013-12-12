(function() {
  var T;

  T = (function() {
    function T() {}

    T.prototype.breakupText = function(text) {
      text = text.match(/.{1,24}/g).map(function(txt) {
        return '<span>' + txt + '</span>';
      });
      return text.join("");
    };

    T.prototype.toLink = function(text) {
      var urlRegex,
        _this = this;
      urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/)(%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      if (urlRegex.test(text)) {
        return this.htmlEntities(text).replace(urlRegex, function(url) {
          if ((url.indexOf(".jpg") > 0) || (url.indexOf(".png") > 0) || (url.indexOf(".gif") > 0)) {
            return '<a href="' + url + '" target="_blank" class="icon-link"><img src="' + url + '" class="thumb"></a>';
          } else {
            return '<a href="' + url + '" target="_blank" class=" break-all"><i class="icon-link"></i><span>' + url + '</span></a>';
          }
        });
      } else {
        return this.breakupText(text);
      }
    };

    T.prototype.htmlEntities = function(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    return T;

  })();

  $(function() {
    return window.t = new T();
  });

}).call(this);
