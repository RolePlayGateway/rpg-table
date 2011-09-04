var http = require('http'),
    faye = require('faye'),
    roll = require('roll');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var diceroller = {
	incoming: function(message, callback) {

		if (message.channel !== '/rolls')
			return callback(message);

    console.log(message);

    var rollResult = roll.roll(message.data.roll);

    message.data = {
      clientID: message.clientId,
      roll: message.data.roll,
      result: rollResult.result
    }

    callback(message);
  }

}

bayeux.addExtension(diceroller);

// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello, non-Bayeux request');
  response.end();
});

bayeux.attach(server);
server.listen(8000);
