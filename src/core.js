
var web = require('./web');
var walrus = require('./walrus');

var Core = (function Core() {

  return {
    run: function(baseDirectory) {
      var webServer = web.Host(require('path').join(baseDirectory, 'site'));
      webServer.addStaticHandler({
        endPoints: ['/', '/index.html', '/index.htm'],
        mimeType: 'text/html',
        relativePath: 'index.html'
      });
      webServer.addCallbackHandler({
        endPoints: ['/v1/list'],
        supportedMethod: 'GET',
        callback: walrus.list
      });
      webServer.addCallbackHandler({
        endPoints: ['/v1/upload'],
        supportedMethod: 'POST',
        callback: walrus.upload
      });
      webServer.run(process.env.PORT || 8001);
    }
  };
}());

exports.run = Core.run;

