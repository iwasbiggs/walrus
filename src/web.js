
var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');

function StaticFileHandler(path) {
  return {
    serve: function(response) {
      var fp = fs.readFile(path, function(err, data) {
        if (err) {
          response.writeHead(404, {"Content-Type": 'text/plain'});
          response.end('Unable to read file from disk');
        } else {
          response.writeHead(200, {"Content-Type": 'text/html'});
          response.end(data);
        }
      });
    }
  };
}

function DefaultHandler() {
  return {
    serve: function(response) {
      response.writeHead(404, {"Content-Type": 'text/plain'});
      response.end();
    }
  };
}

function WebHost(baseDirectory) {
  var staticPaths = {};
  //var connections = [];

  function handleConnection(request, response) {
    var parsed = url.parse(request.url);
    var pathName = parsed.pathname;
    var connection;

    console.log('GET: ' + pathName);
    if (staticPaths[pathName]) {
      connection = StaticFileHandler(
          path.join(baseDirectory, staticPaths[pathName]));
    } else {
      connection = DefaultHandler();
    }
    connection.serve(response);
  }

  return {
    addStaticFileHandler: function(endPoints, relativePath) {
      endPoints.forEach(function(endPoint) {
        staticPaths[endPoint] = relativePath;
      });
    },
    run: function(port) {
      var server = http.createServer(handleConnection);
      server.listen(port);
    }
  };
}

exports.Host = WebHost;

