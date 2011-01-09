
exports.list = function(data, done) {

  console.log('got a list.');

  done({
    responseCode: 200,
    data: {files: ['a', 'b', 'c']}
  });
};

exports.upload = function(data, done) {

  console.log('got an upload.');

  done({
    responseCode: 200,
    data: {name: 'steven'}
  });
};

