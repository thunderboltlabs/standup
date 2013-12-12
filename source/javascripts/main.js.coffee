#= require lo5

class Main

  logging: false

  colors: [
    "yellow",
    "red",
    "ruby",
    "green",
    "cyan",
    "teal",
    "blue",
    "orange",
    "purple",
    "lime",
    "brown"]

  userColor: {}
  scrollTolerance: 15

  constructor: ->
    @avatarTemplate = $('.avatar').remove()
    @shuffleArray()
    $('.avatar').remove()
    @setupEvents()
    $("#message").focus()

  setUser: (user) -> @user = user

  addUsers: (users) ->
    for user in users
      @addUser(user)

  addUser: (user) ->
    sid = user["sid"]
    @log "addUser", sid
    if ($(".avatar[data-sid='#{sid}']").length<1)
      @setColor(sid)
      $el = @avatarTemplate.clone()
      $el.css("margin-left": "20px", "margin-right": "-20px")
      $el.animate("margin-left": 0, "margin-right": 0)
      $el.appendTo($('.avatars'))
      $el.attr("data-sid", sid)
      img = if !!user["image"] then user["image"] else '//localhost:9000/images/avatar.png'
      $el.find('img').attr("src", img)
      $el.find('.name').text(user["name"])
      $el.find('.circle').attr('data-color', @userColor[sid])

  removeUsers: (users) ->
    for user in users
      @removeUser(user)

  removeUser: (user) ->
    sid = user["sid"]
    if ($(".avatar[data-sid='#{sid}']").length>0)
      $(".avatar[data-sid='#{sid}']").remove()
      delete @userColor[sid]

  focusInput: -> setTimeout ( => $("#message").focus() ), 0

  setupEvents: ->
    _self = @
    $(window).on 'keydown', (e) =>
      code = e.keyCode || e.which
      if (code == 9)
        @focusInput()
        e.preventDefault()

    $input = $("#message")
    $input.on 'focus', (e) =>
      $('.input-wrapper').addClass('focus')

    $input.on 'blur', (e) =>
      $('.input-wrapper').removeClass('focus')


    $input.on "keyup", (e) =>
      if (e.keyCode == 13 && !e.shiftKey)
        $("form").submit()

    $('a.button, button').on 'click', (e) => @focusInput()

    $('.avatars').on "click", ".avatar", (e) =>
      sid = $(e.currentTarget).attr("data-sid")
      _self.toggleVisibility(sid)


    $('.avatars').on 'click', (e) => @focusInput()


    _self = @
    $("form").submit (e) =>
      e.preventDefault()
      if ($("#message").val().length > 0)
        who = @user.name
        msg = $("#message").val()
        if (msg == "/reset")
          window.lo5.clearState()
        else
          _self.addMessage
            "sid": "#{@user.sid}"
            "name": "#{who}"
            "data": msg
          window.lo5.sendMessage(msg)
        $("#message").val('')
      return false

  updateState: (users) ->
    for key, value of users
      @applyVisibility key, value


  sendVisibility: (sid) ->
    state = @setVisibility(sid)
    window.lo5.sendState(sid, state)

  toggleVisibility: (sid) ->
    $el = $(".avatar[data-sid='#{sid}']")
    state = if ($el.attr('data-state') == "0") then "1" else "0"
    window.lo5.sendState(sid, state)

  applyVisibility: (sid, state) ->
    $(".avatar[data-sid='#{sid}']").attr('data-state', state)

  addMessage: (data) ->
    sid = data["sid"]
    msg = @parseMessage(data["data"])
    who = @getAvatar(sid)

    $('#messages').append("<li class=#{@userColor[sid]}><p><span class='name'>#{who['name']}</span> #{msg}</p></li>")
    @addChatAvatar(who["el"])
    $('#messages li:first').remove() if $('#messages').find('li').length > 20
    @handleScroll()

  setColor: (sid) -> @userColor[sid] = @getColor()

  getColor: ->
    color = @colors.shift()
    @colors.push(color)
    return color

  shuffleArray: -> @colors = @colors.sort -> 0.5 - Math.random()

  handleScroll: ->
    scrollTo = $('#messages-wrapper').scrollTop()+$('#messages li:last').outerHeight()
    scrollCurrent = $('#messages').outerHeight()-$('#messages-wrapper').outerHeight()
    if scrollTo >= scrollCurrent-@scrollTolerance
      $('#messages-wrapper').animate({ scrollTop: $('#messages').outerHeight() });

  getAvatar: (sid) ->
    $avatar = $(".avatar[data-sid='#{sid}']")
    name = $avatar.find('.name').text()
    color = $avatar.find('.circle').attr('data-color')
    return {"el": $avatar, "name": name, "color": color}

  addChatAvatar: ($el) ->
    $li = $('#messages').find('li:last')
    $el.find('.circle').clone().prependTo($li)

  parseMessage: (text) ->
    text = @htmlEntities(text)
    text = @toLink(text)
    text = @checkForCode(text)

  checkForCode: (text) ->
    regex = /^\s{2,}/g
    if regex.test(text)
      text = '<pre><code>' + text.replace(/\\r\\n/g, '<br />') + '</code></pre>'
    else text

  breakupText: (text) ->
    text = text.match(/.{1,36}/g).map (txt) ->  txt + '<wbr></wbr>'
    text.join("")

  toLink: (text) ->
    urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/)(%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

    if urlRegex.test(text)
      return text.replace urlRegex, (url) =>
        if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) )
          return '<a href="' + url + '" target="_blank" class="icon-link"><img src="' + url + '" class="thumb"></a>'
        else
          return '<a href="' + url + '" target="_blank" class=" break-all"><i class="icon-link"></i><span>' + url + '</span></a>'
    else @breakupText(text)

  htmlEntities: (str) ->
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  log: (params...) ->
    console.log(params) if @logging

$ -> window.main = new Main()
