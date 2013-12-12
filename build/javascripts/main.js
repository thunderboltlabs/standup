(function() {
  var Lo5,
    __slice = [].slice;

  Lo5 = (function() {
    Lo5.prototype.logging = false;

    function Lo5() {
      this.setupHangoutEvents();
    }

    Lo5.prototype.setupHangoutEvents = function() {
      var _this = this;
      gapi.hangout.onApiReady.add(function(event) {
        var participants;
        window.main.setUser(_this.getUserData([gapi.hangout.getLocalParticipant()])[0]);
        participants = gapi.hangout.getParticipants();
        _this.log("onApiReady", participants);
        return window.main.addUsers(_this.getUserData(participants));
      });
      gapi.hangout.onParticipantsAdded.add(function(event) {
        _this.log("onParticipantsAdded", event.addedParticipants);
        return window.main.addUsers(_this.getUserData(event.addedParticipants));
      });
      gapi.hangout.onParticipantsRemoved.add(function(event) {
        _this.log("onParticipantsRemoved", event.removedParticipants);
        return window.main.removeUsers(_this.getUserData(event.removedParticipants));
      });
      gapi.hangout.data.onStateChanged.add(function(event) {
        _this.log("onStateChanged", event.state);
        return window.main.updateState(event.state);
      });
      return gapi.hangout.data.onMessageReceived.add(function(event) {
        _this.log("onMessageReceived", event);
        _this.log("getParticipantById", _this.getMessageData(event));
        return window.main.addMessage(_this.getMessageData(event));
      });
    };

    Lo5.prototype.clearState = function() {
      var key, keys, _i, _len, _results;
      keys = gapi.hangout.data.getKeys();
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        this.sendState(key, 1);
        _results.push(gapi.hangout.data.clearValue(key));
      }
      return _results;
    };

    Lo5.prototype.getMessageData = function(event) {
      var msg, p;
      p = gapi.hangout.getParticipantById(event.senderId);
      return msg = {
        sid: p.id,
        name: p.person.displayName,
        data: event.message
      };
    };

    Lo5.prototype.getUserData = function(persons) {
      var data;
      data = persons.map(function(p) {
        return {
          sid: p.id,
          name: p.person.displayName,
          image: p.person.image.url
        };
      });
      return data;
    };

    Lo5.prototype.sendState = function(sid, state) {
      return gapi.hangout.data.setValue("" + sid, "" + state);
    };

    Lo5.prototype.sendMessage = function(name, msg) {
      return gapi.hangout.data.sendMessage("" + name, "" + msg);
    };

    Lo5.prototype.log = function() {
      var params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.logging) {
        return console.log(params);
      }
    };

    $(function() {
      return window.lo5 = new Lo5();
    });

    return Lo5;

  })();

}).call(this);
(function() {
  var Main,
    __slice = [].slice;

  Main = (function() {
    Main.prototype.logging = false;

    Main.prototype.colors = ["yellow", "red", "ruby", "green", "cyan", "teal", "blue", "orange", "purple", "lime", "brown"];

    Main.prototype.userColor = {};

    Main.prototype.scrollTolerance = 15;

    function Main() {
      this.avatarTemplate = $('.avatar').remove();
      this.shuffleArray();
      $('.avatar').remove();
      this.setupEvents();
      $("#message").focus();
    }

    Main.prototype.setUser = function(user) {
      return this.user = user;
    };

    Main.prototype.addUsers = function(users) {
      var user, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        _results.push(this.addUser(user));
      }
      return _results;
    };

    Main.prototype.addUser = function(user) {
      var $el, img, sid;
      sid = user["sid"];
      this.log("addUser", sid);
      if ($(".avatar[data-sid='" + sid + "']").length < 1) {
        this.setColor(sid);
        $el = this.avatarTemplate.clone();
        $el.css({
          "margin-left": "20px",
          "margin-right": "-20px"
        });
        $el.animate({
          "margin-left": 0,
          "margin-right": 0
        });
        $el.appendTo($('.avatars'));
        $el.attr("data-sid", sid);
        img = !!user["image"] ? user["image"] : '//localhost:9000/images/avatar.png';
        $el.find('img').attr("src", img);
        $el.find('.name').text(user["name"]);
        return $el.find('.circle').attr('data-color', this.userColor[sid]);
      }
    };

    Main.prototype.removeUsers = function(users) {
      var user, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        _results.push(this.removeUser(user));
      }
      return _results;
    };

    Main.prototype.removeUser = function(user) {
      var sid;
      sid = user["sid"];
      if ($(".avatar[data-sid='" + sid + "']").length > 0) {
        $(".avatar[data-sid='" + sid + "']").remove();
        return delete this.userColor[sid];
      }
    };

    Main.prototype.focusInput = function() {
      var _this = this;
      return setTimeout((function() {
        return $("#message").focus();
      }), 0);
    };

    Main.prototype.setupEvents = function() {
      var $input, _self,
        _this = this;
      _self = this;
      $(window).on('keydown', function(e) {
        var code;
        code = e.keyCode || e.which;
        if (code === 9) {
          _this.focusInput();
          return e.preventDefault();
        }
      });
      $input = $("#message");
      $input.on('focus', function(e) {
        return $('.input-wrapper').addClass('focus');
      });
      $input.on('blur', function(e) {
        return $('.input-wrapper').removeClass('focus');
      });
      $input.on("keyup", function(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
          return $("form").submit();
        }
      });
      $('a.button, button').on('click', function(e) {
        return _this.focusInput();
      });
      $('.avatars').on("click", ".avatar", function(e) {
        var sid;
        sid = $(e.currentTarget).attr("data-sid");
        return _self.toggleVisibility(sid);
      });
      $('.avatars').on('click', function(e) {
        return _this.focusInput();
      });
      _self = this;
      return $("form").submit(function(e) {
        var msg, who;
        e.preventDefault();
        if ($("#message").val().length > 0) {
          who = _this.user.name;
          msg = $("#message").val();
          if (msg === "/reset") {
            window.lo5.clearState();
          } else {
            _self.addMessage({
              "sid": "" + _this.user.sid,
              "name": "" + who,
              "data": msg
            });
            window.lo5.sendMessage(msg);
          }
          $("#message").val('');
        }
        return false;
      });
    };

    Main.prototype.updateState = function(users) {
      var key, value, _results;
      _results = [];
      for (key in users) {
        value = users[key];
        _results.push(this.applyVisibility(key, value));
      }
      return _results;
    };

    Main.prototype.sendVisibility = function(sid) {
      var state;
      state = this.setVisibility(sid);
      return window.lo5.sendState(sid, state);
    };

    Main.prototype.toggleVisibility = function(sid) {
      var $el, state;
      $el = $(".avatar[data-sid='" + sid + "']");
      state = $el.attr('data-state') === "0" ? "1" : "0";
      return window.lo5.sendState(sid, state);
    };

    Main.prototype.applyVisibility = function(sid, state) {
      return $(".avatar[data-sid='" + sid + "']").attr('data-state', state);
    };

    Main.prototype.addMessage = function(data) {
      var msg, sid, who;
      sid = data["sid"];
      msg = this.parseMessage(data["data"]);
      who = this.getAvatar(sid);
      $('#messages').append("<li class=" + this.userColor[sid] + "><p><span class='name'>" + who['name'] + "</span> " + msg + "</p></li>");
      this.addChatAvatar(who["el"]);
      if ($('#messages').find('li').length > 20) {
        $('#messages li:first').remove();
      }
      return this.handleScroll();
    };

    Main.prototype.setColor = function(sid) {
      return this.userColor[sid] = this.getColor();
    };

    Main.prototype.getColor = function() {
      var color;
      color = this.colors.shift();
      this.colors.push(color);
      return color;
    };

    Main.prototype.shuffleArray = function() {
      return this.colors = this.colors.sort(function() {
        return 0.5 - Math.random();
      });
    };

    Main.prototype.handleScroll = function() {
      var scrollCurrent, scrollTo;
      scrollTo = $('#messages-wrapper').scrollTop() + $('#messages li:last').outerHeight();
      scrollCurrent = $('#messages').outerHeight() - $('#messages-wrapper').outerHeight();
      if (scrollTo >= scrollCurrent - this.scrollTolerance) {
        return $('#messages-wrapper').animate({
          scrollTop: $('#messages').outerHeight()
        });
      }
    };

    Main.prototype.getAvatar = function(sid) {
      var $avatar, color, name;
      $avatar = $(".avatar[data-sid='" + sid + "']");
      name = $avatar.find('.name').text();
      color = $avatar.find('.circle').attr('data-color');
      return {
        "el": $avatar,
        "name": name,
        "color": color
      };
    };

    Main.prototype.addChatAvatar = function($el) {
      var $li;
      $li = $('#messages').find('li:last');
      return $el.find('.circle').clone().prependTo($li);
    };

    Main.prototype.parseMessage = function(text) {
      text = this.htmlEntities(text);
      text = this.toLink(text);
      return text = this.checkForCode(text);
    };

    Main.prototype.checkForCode = function(text) {
      var regex;
      regex = /^\s{2,}/g;
      if (regex.test(text)) {
        return text = '<pre><code>' + text.replace(/\\r\\n/g, '<br />') + '</code></pre>';
      } else {
        return text;
      }
    };

    Main.prototype.breakupText = function(text) {
      text = text.match(/.{1,36}/g).map(function(txt) {
        return txt + '<wbr></wbr>';
      });
      return text.join("");
    };

    Main.prototype.toLink = function(text) {
      var urlRegex,
        _this = this;
      urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/)(%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      if (urlRegex.test(text)) {
        return text.replace(urlRegex, function(url) {
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

    Main.prototype.htmlEntities = function(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    Main.prototype.log = function() {
      var params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.logging) {
        return console.log(params);
      }
    };

    return Main;

  })();

  $(function() {
    return window.main = new Main();
  });

}).call(this);
