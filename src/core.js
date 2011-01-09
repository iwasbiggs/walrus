
var web = require('./web');

var Core = (function Core() {

  return {
    run: function(baseDirectory) {
      var webServer = web.Host(require('path').join(baseDirectory, 'site'));
      webServer.addStaticFileHandler(
        ['/', '/index.html', '/index.htm'], 'index.html');
      webServer.run(process.env.PORT || 8001);
    }
  };
}());

exports.run = Core.run;

