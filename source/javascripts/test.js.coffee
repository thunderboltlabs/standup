class T
  constructor: ->
  breakupText: (text) ->
      text = text.match(/.{1,24}/g).map (txt) -> '<span>' + txt + '</span>'
      text.join("")

  toLink: (text) ->
    urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/)(%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

    if urlRegex.test(text)
      return @htmlEntities(text).replace urlRegex, (url) => 
        if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) )
          return '<a href="' + url + '" target="_blank" class="icon-link"><img src="' + url + '" class="thumb"></a>'
        else
          return '<a href="' + url + '" target="_blank" class=" break-all"><i class="icon-link"></i><span>' + url + '</span></a>'
    else @breakupText(text)

  htmlEntities: (str) ->
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

$ -> window.t = new T()