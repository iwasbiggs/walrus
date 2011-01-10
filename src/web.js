
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

function CallbackHandler(request, callback) {
  return {
    serve: function(response) {
      callback(request, function(result) {
        var mimeType = result.mimeType || 'application/json';
        response.writeHead(
          result.responseCode, {"Content-Type": mimeType});
        if (mimeType === 'application/json') {
          response.end(JSON.stringify(result.data));
        } else {
          response.end(result.data);
        }
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

  function determineHandler(request) {
    var parsedRequest = url.parse(request.url);
    var requestMethod = request.method;
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
      connection = CallbackHandler(request, callbackHandler.callback);
    }
    return connection;
  }

  function handleConnection(request, response) {
    var connection = determineHandler(request) || DefaultHandler();
    connection.serve(response);
  }

  return {
    addCallbackHandler: function(callbackParams) {
      if (!callbackParams.supportedMethod) {
        throw new Error('supportedMethod not found!');
      }
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

