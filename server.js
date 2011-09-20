var http = require('http'),
    url  = require('url'),
    fs   = require('fs'),
    faye = require('faye'),
    roll = require('roll');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var diceroller = {
	incoming: function(message, callback) {

		if (message.channel !== '/tables/asdf/rolls')
			return callback(message);

    console.log(message);

    var rollResult = roll.roll(message.data.roll);

    message.data = {
      clientID: message.clientId,
      username: message.data.username,
      roll: message.data.roll,
      result: rollResult.result
    }

    callback(message);
  }

}

bayeux.addExtension(diceroller);

// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {

  var parts = url.parse(request.url);

  switch(parts.pathname) {
    case '/':
      fs.readFile('./index.html', function(err, content) {
            if (err) {
                response.writeHead(500);
                response.end();
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content, 'utf-8');
            }
      });
    break;
    case '/app.xml':
      fs.readFile('./app.xml', function(err, content) {
            if (err) {
                response.writeHead(500);
                response.end();
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content, 'utf-8');
            }
      });
    break;
  }

});

bayeux.attach(server);
server.listen(80);
