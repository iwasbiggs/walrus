
var MAX_SIZE_PER_FILE = 5 * 1024 * 1024;

function StoredFile() {
  var chunks = [];
  var age = Date.now();
  
  return {
    addBuffer: function(chunk) {
      chunks.push(chunk);
    },
    getBuffer: function(index) {
      return chunks[index];
    },
    size: function() {
      var total = 0;
      chunks.forEach(function(chunk) {
        total += chunk.length;
      });
      return total;
    }
  };
}

var Walrus = (function Walrus() {
  var files = {};

  var addFileToCache = (function() {
    var id = 0;
    return function(newFile) {
      id += 1;
      files[id] = newFile;
      return id;
    };
  }());

  return {
    download: function(request, done) {
      console.log('got a download.');
      done({
        responseCode: 200,
        data: {message: 'hi'}
      });
    },
    list: function(request, done) {
      console.log('got a list.');
      done({
        responseCode: 200,
        data: {files: ['a', 'b', 'c']}
      });
    },
    upload: function(request, done) {
      console.log('got an upload.' + JSON.stringify(request.headers));
      var file = StoredFile();

      function stopUpload(finalSay) {
        request.removeAllListeners('data');
        request.removeAllListeners('end');
        done(finalSay);
      }

      request.on('data', function(chunk) {
        console.log('got data chunk.' + chunk.length);
        if (file.size() + chunk.length > MAX_SIZE_PER_FILE) {
          stopUpload({
            responseCode: 501,
            data: {error: 'File was too large.'}
          });
        } else {
          file.addBuffer(chunk);
        }
      });
      request.on('end', function() {
        console.log('end of data, file size: ' + file.size());
        var id = addFileToCache(file);
        stopUpload({responseCode: 200, data: {id: id}});
        var fs = require('fs');
        fs.writeFileSync('/tmp/one', file.getBuffer(0));
        fs.writeFileSync('/tmp/two', file.getBuffer(1));
      });
    }
  };
}());

exports.download = Walrus.download;
exports.list = Walrus.list;
exports.upload = Walrus.upload;

