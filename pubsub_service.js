var subscribedTo = [];
var socket;
 
exports.setSocket = function(s) {
  socket = s;
};

exports.publish = function(name, data) {
  if(subscribedTo.indexOf(name) !== -1) {
    if(socket) {
      var httpResponse = 'HTTP/1.1 200 OK\r\n';
      httpResponse += 'elroy-queue-name:'+name+'\r\n\r\n';
      httpResponse += data.toString();
      socket.send(httpResponse);
    } else {
      console.log('no socket');
    }
  }
};

exports.subscribe = function(name) {
  if (subscribedTo.indexOf(name) === -1) {
    subscribedTo.push(name);
  }
};
 
exports.unsubscribe = function(name) {
  var i = subscribedTo.indexOf(name);
  subscribedTo.splice(i);
};