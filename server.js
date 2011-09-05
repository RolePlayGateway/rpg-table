var http = require('http'),
    fs   = require('fs'),
    faye = require('faye'),
    roll = require('roll');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var diceroller = {
	incoming: function(message, callback) {

		if (message.channel.substring(-6) == '/rolls')
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
  fs.readFile('./index.html', function(err, content) {

        if (err) {
            response.writeHead(500);
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
        }

  });
});

bayeux.attach(server);
server.listen(80);
