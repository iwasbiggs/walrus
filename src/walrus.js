
var formidable = require('formidable');
var fs = require('fs');

var MAX_SIZE_PER_FILE = 5 * 1024 * 1024;

function StoredFile(fileData) {
  var age = Date.now();
  
  return {
    remove: function() {
      fs.unlinkSync(fileData.path);
    },
    getData: function(done) {
      fs.readFile(fileData.path, function(err, data) {
        if (err) {
          done('');
        } else {
          done(data);
        }
      });
    },
    getLength: function() {
      return fileData.length;
    },
    getMimeType: function() {
      return fileData.mime;
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
      var form = new formidable.IncomingForm();
      form.parse(request, function(err, fields, files) {
        var fileData = files.fileData;
        if (!fileData) {
          done({responseCode: 501, data: {error: 'fileData not uploaded.'}});
        } else if (fileData.length > MAX_SIZE_PER_FILE) {
          done({responseCode: 501, data: {error: 'fileData too large.'}});
        } else {
          console.log('recorded upload: ' + fileData.path);
          done({
            responseCode: 200,
            data: {id: addFileToCache(StoredFile(fileData))}
          });
        }
      });
    },
    view: function(request, done) {
      var query = require('querystring').parse(
          require('url').parse(request.url).query);
      var id = query.id;
      var storedFile = files[id];
      if (id === undefined) {
        done({
          responseCode: 501,
          data: {error: 'id not found in request'}
        });
      } else if (!storedFile) {
        done({
          responseCode: 404,
          data: {error: 'No file with that id'}
        });
      } else {
        storedFile.getData(function(wholeFile) {
          done({
            responseCode: 200,
            mimeType: storedFile.getMimeType(),
            data: wholeFile
          });
        });
      }
    }
  };
}());

exports.download = Walrus.download;
exports.list = Walrus.list;
exports.upload = Walrus.upload;
exports.view = Walrus.view;

