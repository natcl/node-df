'use strict';

(function(DFHelper, spawnSync, _, os) {

  function df(options, callback) {

    if (!_.isFunction(callback)) {
      callback = _.isFunction(options) ? options : DFHelper.noop;
    }

    if (_.isFunction(options) || !_.isObject(options)) {
      options = {};
    }

    var platform = os.platform();

    if (platform === 'win32') {
	  try {
		  const commandResult = spawnSync('wmic', ['logicaldisk','where','drivetype=3', 'get', 'Caption,filesystem,size,freespace', '/format:csv'], {windowsHide: true});
		  const data = commandResult.stdout.toString()
		  var response = DFHelper.parseWin32(data.toString(), options);
		  var result = [];
		  for (var k in response) {
			if (response.hasOwnProperty(k) && response[k]) {
			  result.push(response[k]);
			}
		  }
		  callback(null, result);
	  } catch (error) {
		callback(error);
	  }
    } else {

      var
        baseCmd = 'df -kP',
        cmd = options.file ? baseCmd + ' ' + options.file : baseCmd;

      exec(cmd, function(error, stdout, stderr) {

        if (error) {
          return callback(error);
        }

        if (stderr) {
          return callback(new Error(stderr));
        }

        var response = DFHelper.parse(stdout, options);

        callback(null, response);
      });
    }
  }

  df.Helper = DFHelper;

  module.exports = df;

}(
  require('./helpers/DFHelper'),
  require('child_process').spawnSync,
  require('underscore'),
  require('os')
));
