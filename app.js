var util=require('util'),
    http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, i am jungle, and i know nodejitsu.')
  res.end();
}).listen(8002);

/* server started */
util.puts('> hello world jungle_deploy running on port 8002');

