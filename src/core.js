
var web = require('./web');
var walrus = require('./walrus');

var Core = (function Core() {
  var webServer;

  return {
    run: function(baseDirectory) {
      webServer = web.Host(require('path').join(baseDirectory, 'site'));
      webServer.addStaticHandler({
        endPoints: ['/'],
        mimeType: 'text/html',
        relativePath: 'index.html'
      });
      webServer.addCallbackHandler({
        endPoints: ['/list', '/v1/list'],
        supportedMethod: 'GET',
        callback: walrus.list
      });
      webServer.addCallbackHandler({
        endPoints: ['/upload', '/v1/upload'],
        supportedMethod: 'POST',
        callback: walrus.upload
      });
      webServer.addCallbackHandler({
        endPoints: ['/download', '/v1/download'],
        supportedMethod: 'GET',
        callback: walrus.download
      });
      webServer.addCallbackHandler({
        endPoints: ['/view', '/v1/view'],
        supportedMethod: 'GET',
        callback: walrus.view
      });
      webServer.run(process.env.PORT || 8001);
    }
  };
}());

exports.run = Core.run;

