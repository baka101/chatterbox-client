// YOUR CODE HERE:
// /////////////////////////////////////////
// chatterbox Application Class
// /////////////////////////////////////////
var App = function(){
  this.data = {};
  this.rooms = {};
  this.friends = {};
  this.refreshID = null;
  this.url = 'https://api.parse.com/1/classes/chatterbox';
}

App.prototype.init = function(){
  var index = window.location.href.indexOf("username=");
  this.username = window.location.href.split("").slice(index+9).join("");
  app.refreshRooms();
  var context = this;
  this.fetch(this.url, function(array){
    _.each(array, function(item){
      context.data[item.objectId] = item;
      context.addMessage(item, "appendTo");
    });
  });
};

App.prototype.send = function(message){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

App.prototype.fetch = function(url, callback){
  var context = this;
  $.ajax({
    type: 'GET',
    url: url,
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message get');
      callback(data.results);
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
};

App.prototype.clearMessages = function(){
  $("#chats").html('');
};

App.prototype.addMessage = function(msgObject, addTo){
  addTo = addTo || 'appendTo';
  var $username = $('<div></div>').text(msgObject.username);
  $username.addClass('username');
  var $text = $('<div></div>').text(msgObject.text);
  var $roomname = $('<div></div>').text(msgObject.roomname);

  var $message = $('<li></li>');
  $message.addClass('well');
  $message.append($username, $text, $roomname);

  $message[addTo]('#chats');
};

App.prototype.refreshMessages = function() {
  var context = this;

  //callback function takes in an array of message
  //objects
  var accessEach = function (objArray) {
    _.each(objArray, function(item){
        if(!(item.objectId in context.data)){
          context.data[item.objectId] = item;
          context.addMessage(item, "prependTo");
        }
    });
  };

  this.fetch('https://api.parse.com/1/classes/chatterbox', accessEach);

  context.refreshRooms();
};

App.prototype.refreshRooms = function () {
  var context = this;

  var getRooms = function (objArray) {
    _.each(objArray, function (item) {
      if (!(item.roomname in context.rooms) && item.roomname) {
        context.addRoom(item.roomname);
        context.rooms[item.roomname] = item.roomname;
      }
    });

  }

  this.fetch('https://api.parse.com/1/classes/chatterbox', getRooms);

}

App.prototype.addRoom = function(roomname){
  $('<option></option>').val(roomname).text(roomname).appendTo('#roomSelect');
};


var app = new App();
app.init();

/////////////////////////////////////////////////
/// jQuery DOM interactions
/////////////////////////////////////////////////
$(document).on('ready', function () {

  $('.menu').on('click', 'button.refresh', function(e) {
    app.refreshID = setInterval(app.refreshMessages.bind(app), 1000);
    $(this).text('Stop Refreshing');
    $(this).toggleClass('stopRefresh');
    $(this).toggleClass('refresh');
  });

  $('.menu').on('click', 'button.stopRefresh', function(e) {
    if (app.refreshID) {
      clearInterval(app.refreshID);
    }

    $(this).text('Refresh');
    $(this).toggleClass('stopRefresh');
    $(this).toggleClass('refresh');
  });

  $('.submit').on('click', function(e){
    var room = $('#roomname').val();

    if (room === '') {
      room = $('#roomSelect').val();
    }

    var msg = {
      username: app.username,
      roomname: room,
      text: $('#message').val()
    };

    app.send(msg);
    $('#message').val('');
  });

  $('#main').on('click', '.username', function (e) {
    var name = $(this).text();
    if (!(name in app.friends)) {
      $('.friends-list').append($('<li></li>').text(name));
      app.friends[name] = name;
    }
  });

});
