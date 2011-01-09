
var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');

function StaticFileHandler(fullPath, mimeType) {
  return {
    serve: function(response) {
      var fp = fs.readFile(fullPath, function(err, data) {
        if (err) {
          response.writeHead(500, {"Content-Type": 'text/plain'});
          response.end('There was a problem with the walrus, not you.');
        } else {
          response.writeHead(200, {"Content-Type": mimeType});
          response.end(data);
        }
      });
    }
  };
}

function CallbackHandler(callback) {
  return {
    serve: function(response) {
      callback('a visitor', function(result) {
        response.writeHead(
          result.responseCode, {"Content-Type": 'application/json'});
        response.end(JSON.stringify(result.data));
      });
    }
  };
}

function DefaultHandler() {
  return {
    serve: function(response) {
      response.writeHead(301, {"Location": '/'});
      response.end();
    }
  };
}

function WebHost(baseDirectory) {
  var staticPaths = {};
  var callbackPaths = {};

  function determineHandler(parsedRequest, requestMethod) {
    var pathName = parsedRequest.pathname;
    var callbackHandler = callbackPaths[pathName];
    var staticHandler = staticPaths[pathName];
    var connection;

    console.log(requestMethod + ': ' + pathName);

    if (staticHandler && requestMethod === 'GET') {
      connection = StaticFileHandler(
          path.join(baseDirectory, staticHandler.relativePath),
          staticHandler.mimeType);
    } else if (callbackHandler &&
        callbackHandler.supportedMethod === requestMethod) {
      connection = CallbackHandler(callbackHandler.callback);
    }
    return connection;
  }

  function handleConnection(request, response) {
    var connection =
      determineHandler(url.parse(request.url), request.method) || DefaultHandler();
    connection.serve(response);
  }

  return {
    addCallbackHandler: function(callbackParams) {
      var endPoints = callbackParams.endPoints;
      var callback = callbackParams.callback;
      var supportedMethod = callbackParams.supportedMethod;
      endPoints.forEach(function(endPoint) {
        callbackPaths[endPoint] = {
          callback: callback,
          supportedMethod: supportedMethod
        };
      });
    },
    addStaticHandler: function(handleParams) {
      var endPoints = handleParams.endPoints;
      var relativePath = handleParams.relativePath;
      var mimeType = handleParams.mimeType;
      endPoints.forEach(function(endPoint) {
        staticPaths[endPoint] = {
          relativePath: relativePath,
          mimeType: mimeType
        };
      });
    },
    run: function(port) {
      var server = http.createServer(handleConnection);
      server.listen(port);
    }
  };
}

exports.Host = WebHost;
