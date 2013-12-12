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
