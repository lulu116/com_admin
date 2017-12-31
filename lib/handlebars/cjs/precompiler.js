/* eslint-disable no-console */
'use strict';

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _handlebars = require('./handlebars');

var Handlebars = _interopRequireWildcard(_handlebars);

var _path = require('path');

var _sourceMap = require('source-map');

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

module.exports.loadTemplates = function (opts, callback) {
  loadStrings(opts, function (err, strings) {
    if (err) {
      callback(err);
    } else {
      loadFiles(opts, function (err, files) {
        if (err) {
          callback(err);
        } else {
          opts.templates = strings.concat(files);
          callback(undefined, opts);
        }
      });
    }
  });
};

function loadStrings(opts, callback) {
  var strings = arrayCast(opts.string),
      names = arrayCast(opts.name);

  if (names.length !== strings.length && strings.length > 1) {
    return callback(new Handlebars.Exception('Number of names did not match the number of string inputs'));
  }

  _async2['default'].map(strings, function (string, callback) {
    if (string !== '-') {
      callback(undefined, string);
    } else {
      (function () {
        // Load from stdin
        var buffer = '';
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (chunk) {
          buffer += chunk;
        });
        process.stdin.on('end', function () {
          callback(undefined, buffer);
        });
      })();
    }
  }, function (err, strings) {
    strings = strings.map(function (string, index) {
      return {
        name: names[index],
        path: names[index],
        source: string
      };
    });
    callback(err, strings);
  });
}

function loadFiles(opts, callback) {
  // Build file extension pattern
  var extension = (opts.extension || 'handlebars').replace(/[\\^$*+?.():=!|{}\-\[\]]/g, function (arg) {
    return '\\' + arg;
  });
  extension = new RegExp('\\.' + extension + '$');

  var ret = [],
      queue = (opts.files || []).map(function (template) {
    return { template: template, root: opts.root };
  });
  _async2['default'].whilst(function () {
    return queue.length;
  }, function (callback) {
    var _queue$shift = queue.shift();

    var path = _queue$shift.template;
    var root = _queue$shift.root;

    _fs2['default'].stat(path, function (err, stat) {
      if (err) {
        return callback(new Handlebars.Exception('Unable to open template file "' + path + '"'));
      }

      if (stat.isDirectory()) {
        opts.hasDirectory = true;

        _fs2['default'].readdir(path, function (err, children) {
          /* istanbul ignore next : Race condition that being too lazy to test */
          if (err) {
            return callback(err);
          }
          children.forEach(function (file) {
            var childPath = path + '/' + file;

            if (extension.test(childPath) || _fs2['default'].statSync(childPath).isDirectory()) {
              queue.push({ template: childPath, root: root || path });
            }
          });

          callback();
        });
      } else {
        _fs2['default'].readFile(path, 'utf8', function (err, data) {
          /* istanbul ignore next : Race condition that being too lazy to test */
          if (err) {
            return callback(err);
          }

          if (opts.bom && data.indexOf('﻿') === 0) {
            data = data.substring(1);
          }

          // Clean the template name
          var name = path;
          if (!root) {
            name = _path.basename(name);
          } else if (name.indexOf(root) === 0) {
            name = name.substring(root.length + 1);
          }
          name = name.replace(extension, '');

          ret.push({
            path: path,
            name: name,
            source: data
          });

          callback();
        });
      }
    });
  }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(undefined, ret);
    }
  });
}

module.exports.cli = function (opts) {
  if (opts.version) {
    console.log(Handlebars.VERSION);
    return;
  }

  if (!opts.templates.length && !opts.hasDirectory) {
    throw new Handlebars.Exception('Must define at least one template or directory.');
  }

  if (opts.simple && opts.min) {
    throw new Handlebars.Exception('Unable to minimize simple output');
  }

  var multiple = opts.templates.length !== 1 || opts.hasDirectory;
  if (opts.simple && multiple) {
    throw new Handlebars.Exception('Unable to output multiple templates in simple mode');
  }

  // Force simple mode if we have only one template and it's unnamed.
  if (!opts.amd && !opts.commonjs && opts.templates.length === 1 && !opts.templates[0].name) {
    opts.simple = true;
  }

  // Convert the known list into a hash
  var known = {};
  if (opts.known && !Array.isArray(opts.known)) {
    opts.known = [opts.known];
  }
  if (opts.known) {
    for (var i = 0, len = opts.known.length; i < len; i++) {
      known[opts.known[i]] = true;
    }
  }

  var objectName = opts.partial ? 'Handlebars.partials' : 'templates';

  var output = new _sourceMap.SourceNode();
  if (!opts.simple) {
    if (opts.amd) {
      output.add('define([\'' + opts.handlebarPath + 'handlebars.runtime\'], function(Handlebars) {\n  Handlebars = Handlebars["default"];');
    } else if (opts.commonjs) {
      output.add('var Handlebars = require("' + opts.commonjs + '");');
    } else {
      output.add('(function() {\n');
    }
    output.add('  var template = Handlebars.template, templates = ');
    if (opts.namespace) {
      output.add(opts.namespace);
      output.add(' = ');
      output.add(opts.namespace);
      output.add(' || ');
    }
    output.add('{};\n');
  }

  opts.templates.forEach(function (template) {
    var options = {
      knownHelpers: known,
      knownHelpersOnly: opts.o
    };

    if (opts.map) {
      options.srcName = template.path;
    }
    if (opts.data) {
      options.data = true;
    }

    var precompiled = Handlebars.precompile(template.source, options);

    // If we are generating a source map, we have to reconstruct the SourceNode object
    if (opts.map) {
      var consumer = new _sourceMap.SourceMapConsumer(precompiled.map);
      precompiled = _sourceMap.SourceNode.fromStringWithSourceMap(precompiled.code, consumer);
    }

    if (opts.simple) {
      output.add([precompiled, '\n']);
    } else {
      if (!template.name) {
        throw new Handlebars.Exception('Name missing for template');
      }

      if (opts.amd && !multiple) {
        output.add('return ');
      }
      output.add([objectName, '[\'', template.name, '\'] = template(', precompiled, ');\n']);
    }
  });

  // Output the content
  if (!opts.simple) {
    if (opts.amd) {
      if (multiple) {
        output.add(['return ', objectName, ';\n']);
      }
      output.add('});');
    } else if (!opts.commonjs) {
      output.add('})();');
    }
  }

  if (opts.map) {
    output.add('\n//# sourceMappingURL=' + opts.map + '\n');
  }

  output = output.toStringWithSourceMap();
  output.map = output.map + '';

  if (opts.min) {
    output = _uglifyJs2['default'].minify(output.code, {
      fromString: true,

      outSourceMap: opts.map,
      inSourceMap: JSON.parse(output.map)
    });
    if (opts.map) {
      output.code += '\n//# sourceMappingURL=' + opts.map + '\n';
    }
  }

  if (opts.map) {
    _fs2['default'].writeFileSync(opts.map, output.map, 'utf8');
  }
  output = output.code;

  if (opts.output) {
    _fs2['default'].writeFileSync(opts.output, output, 'utf8');
  } else {
    console.log(output);
  }
};

function arrayCast(value) {
  value = value != null ? value : [];
  if (!Array.isArray(value)) {
    value = [value];
  }
  return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9wcmVjb21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztxQkFDa0IsT0FBTzs7OztrQkFDVixJQUFJOzs7OzBCQUNTLGNBQWM7O0lBQTlCLFVBQVU7O29CQUNDLE1BQU07O3lCQUNlLFlBQVk7O3dCQUNyQyxXQUFXOzs7O0FBRTlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVMsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUN0RCxhQUFXLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUN2QyxRQUFJLEdBQUcsRUFBRTtBQUNQLGNBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNmLE1BQU07QUFDTCxlQUFTLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNuQyxZQUFJLEdBQUcsRUFBRTtBQUNQLGtCQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDZixNQUFNO0FBQ0wsY0FBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZDLGtCQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOztBQUVGLFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDbkMsTUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7TUFDaEMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWpDLE1BQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsTUFBTSxJQUM1QixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN6QixXQUFPLFFBQVEsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsMkRBQTJELENBQUMs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QUUsSUFBSSxDQUFDLEdBQUc7QUFDdEIsaUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7S0FDcEMsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osWUFBTSxDQUFDLElBQUksSUFBSSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztLQUM1RDtHQUNGOztBQUVELE1BQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNaLG9CQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDaEQ7QUFDRCxRQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFckIsTUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2Ysb0JBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQy9DLE1BQU07QUFDTCxXQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3JCO0NBQ0YsQ0FBQzs7QUFFRixTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDeEIsT0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN6QixTQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNqQjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2QiLCJmaWxlIjoicHJlY29tcGlsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgQXN5bmMgZnJvbSAnYXN5bmMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnLi9oYW5kbGViYXJzJztcbmltcG9ydCB7YmFzZW5hbWV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTb3VyY2VNYXBDb25zdW1lciwgU291cmNlTm9kZX0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQgdWdsaWZ5IGZyb20gJ3VnbGlmeS1qcyc7XG5cbm1vZHVsZS5leHBvcnRzLmxvYWRUZW1wbGF0ZXMgPSBmdW5jdGlvbihvcHRzLCBjYWxsYmFjaykge1xuICBsb2FkU3RyaW5ncyhvcHRzLCBmdW5jdGlvbihlcnIsIHN0cmluZ3MpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkRmlsZXMob3B0cywgZnVuY3Rpb24oZXJyLCBmaWxlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRzLnRlbXBsYXRlcyA9IHN0cmluZ3MuY29uY2F0KGZpbGVzKTtcbiAgICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gbG9hZFN0cmluZ3Mob3B0cywgY2FsbGJhY2spIHtcbiAgbGV0IHN0cmluZ3MgPSBhcnJheUNhc3Qob3B0cy5zdHJpbmcpLFxuICAgICAgbmFtZXMgPSBhcnJheUNhc3Qob3B0cy5uYW1lKTtcblxuICBpZiAobmFtZXMubGVuZ3RoICE9PSBzdHJpbmdzLmxlbmd0aFxuICAgICAgJiYgc3RyaW5ncy5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignTnVtYmVyIG9mIG5hbWVzIGRpZCBub3QgbWF0Y2ggdGhlIG51bWJlciBvZiBzdHJpbmcgaW5wdXRzJykpO1xuICB9XG5cbiAgQXN5bmMubWFwKHN0cmluZ3MsIGZ1bmN0aW9uKHN0cmluZywgY2FsbGJhY2spIHtcbiAgICAgIGlmIChzdHJpbmcgIT09ICctJykge1xuICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIHN0cmluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBMb2FkIGZyb20gc3RkaW5cbiAgICAgICAgbGV0IGJ1ZmZlciA9ICcnO1xuICAgICAgICBwcm9jZXNzLnN0ZGluLnNldEVuY29kaW5nKCd1dGY4Jyk7XG5cbiAgICAgICAgcHJvY2Vzcy5zdGRpbi5vbignZGF0YScsIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgICAgYnVmZmVyICs9IGNodW5rO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzcy5zdGRpbi5vbignZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2sodW5kZWZpbmVkLCBidWZmZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZ1bmN0aW9uKGVyciwgc3RyaW5ncykge1xuICAgICAgc3RyaW5ncyA9IHN0cmluZ3MubWFwKChzdHJpbmcsIGluZGV4KSA9PiAoe1xuICAgICAgICBuYW1lOiBuYW1lc1tpbmRleF0sXG4gICAgICAgIHBhdGg6IG5hbWVzW2luZGV4XSxcbiAgICAgICAgc291cmNlOiBzdHJpbmdcbiAgICAgIH0pKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgc3RyaW5ncyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRGaWxlcyhvcHRzLCBjYWxsYmFjaykge1xuICAvLyBCdWlsZCBmaWxlIGV4dGVuc2lvbiBwYXR0ZXJuXG4gIGxldCBleHRlbnNpb24gPSAob3B0cy5leHRlbnNpb24gfHwgJ2hhbmRsZWJhcnMnKS5yZXBsYWNlKC9bXFxcXF4kKis/LigpOj0hfHt9XFwtXFxbXFxdXS9nLCBmdW5jdGlvbihhcmcpIHsgcmV0dXJuICdcXFxcJyArIGFyZzsgfSk7XG4gIGV4dGVuc2lvbiA9IG5ldyBSZWdFeHAoJ1xcXFwuJyArIGV4dGVuc2lvbiArICckJyk7XG5cbiAgbGV0IHJldCA9IFtdLFxuICAgICAgcXVldWUgPSAob3B0cy5maWxlcyB8fCBbXSkubWFwKCh0ZW1wbGF0ZSkgPT4gKHt0ZW1wbGF0ZSwgcm9vdDogb3B0cy5yb290fSkpO1xuICBBc3luYy53aGlsc3QoKCkgPT4gcXVldWUubGVuZ3RoLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGxldCB7dGVtcGxhdGU6IHBhdGgsIHJvb3R9ID0gcXVldWUuc2hpZnQoKTtcblxuICAgIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24oZXJyLCBzdGF0KSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oYFVuYWJsZSB0byBvcGVuIHRlbXBsYXRlIGZpbGUgXCIke3BhdGh9XCJgKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgb3B0cy5oYXNEaXJlY3RvcnkgPSB0cnVlO1xuXG4gICAgICAgIGZzLnJlYWRkaXIocGF0aCwgZnVuY3Rpb24oZXJyLCBjaGlsZHJlbikge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IDogUmFjZSBjb25kaXRpb24gdGhhdCBiZWluZyB0b28gbGF6eSB0byB0ZXN0ICovXG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgbGV0IGNoaWxkUGF0aCA9IHBhdGggKyAnLycgKyBmaWxlO1xuXG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uLnRlc3QoY2hpbGRQYXRoKSB8fCBmcy5zdGF0U3luYyhjaGlsZFBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgcXVldWUucHVzaCh7dGVtcGxhdGU6IGNoaWxkUGF0aCwgcm9vdDogcm9vdCB8fCBwYXRofSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsICd1dGY4JywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgOiBSYWNlIGNvbmRpdGlvbiB0aGF0IGJlaW5nIHRvbyBsYXp5IHRvIHRlc3QgKi9cbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAob3B0cy5ib20gJiYgZGF0YS5pbmRleE9mKCdcXHVGRUZGJykgPT09IDApIHtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnN1YnN0cmluZygxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDbGVhbiB0aGUgdGVtcGxhdGUgbmFtZVxuICAgICAgICAgIGxldCBuYW1lID0gcGF0aDtcbiAgICAgICAgICBpZiAoIXJvb3QpIHtcbiAgICAgICAgICAgIG5hbWUgPSBiYXNlbmFtZShuYW1lKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuaW5kZXhPZihyb290KSA9PT0gMCkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKHJvb3QubGVuZ3RoICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoZXh0ZW5zaW9uLCAnJyk7XG5cbiAgICAgICAgICByZXQucHVzaCh7XG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHNvdXJjZTogZGF0YVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKHVuZGVmaW5lZCwgcmV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jbGkgPSBmdW5jdGlvbihvcHRzKSB7XG4gIGlmIChvcHRzLnZlcnNpb24pIHtcbiAgICBjb25zb2xlLmxvZyhIYW5kbGViYXJzLlZFUlNJT04pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghb3B0cy50ZW1wbGF0ZXMubGVuZ3RoICYmICFvcHRzLmhhc0RpcmVjdG9yeSkge1xuICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignTXVzdCBkZWZpbmUgYXQgbGVhc3Qgb25lIHRlbXBsYXRlIG9yIGRpcmVjdG9yeS4nKTtcbiAgfVxuXG4gIGlmIChvcHRzLnNpbXBsZSAmJiBvcHRzLm1pbikge1xuICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignVW5hYmxlIHRvIG1pbmltaXplIHNpbXBsZSBvdXRwdXQnKTtcbiAgfVxuXG4gIGNvbnN0IG11bHRpcGxlID0gb3B0cy50ZW1wbGF0ZXMubGVuZ3RoICE9PSAxIHx8IG9wdHMuaGFzRGlyZWN0b3J5O1xuICBpZiAob3B0cy5zaW1wbGUgJiYgbXVsdGlwbGUpIHtcbiAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ1VuYWJsZSB0byBvdXRwdXQgbXVsdGlwbGUgdGVtcGxhdGVzIGluIHNpbXBsZSBtb2RlJyk7XG4gIH1cblxuICAvLyBGb3JjZSBzaW1wbGUgbW9kZSBpZiB3ZSBoYXZlIG9ubHkgb25lIHRlbXBsYXRlIGFuZCBpdCdzIHVubmFtZWQuXG4gIGlmICghb3B0cy5hbWQgJiYgIW9wdHMuY29tbW9uanMgJiYgb3B0cy50ZW1wbGF0ZXMubGVuZ3RoID09PSAxXG4gICAgICAmJiAhb3B0cy50ZW1wbGF0ZXNbMF0ubmFtZSkge1xuICAgIG9wdHMuc2ltcGxlID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgdGhlIGtub3duIGxpc3QgaW50byBhIGhhc2hcbiAgbGV0IGtub3duID0ge307XG4gIGlmIChvcHRzLmtub3duICYmICFBcnJheS5pc0FycmF5KG9wdHMua25vd24pKSB7XG4gICAgb3B0cy5rbm93biA9IFtvcHRzLmtub3duXTtcbiAgfVxuICBpZiAob3B0cy5rbm93bikge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBvcHRzLmtub3duLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBrbm93bltvcHRzLmtub3duW2ldXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb2JqZWN0TmFtZSA9IG9wdHMucGFydGlhbCA/ICdIYW5kbGViYXJzLnBhcnRpYWxzJyA6ICd0ZW1wbGF0ZXMnO1xuXG4gIGxldCBvdXRwdXQgPSBuZXcgU291cmNlTm9kZSgpO1xuICBpZiAoIW9wdHMuc2ltcGxlKSB7XG4gICAgaWYgKG9wdHMuYW1kKSB7XG4gICAgICBvdXRwdXQuYWRkKCdkZWZpbmUoW1xcJycgKyBvcHRzLmhhbmRsZWJhclBhdGggKyAnaGFuZGxlYmFycy5ydW50aW1lXFwnXSwgZnVuY3Rpb24oSGFuZGxlYmFycykge1xcbiAgSGFuZGxlYmFycyA9IEhhbmRsZWJhcnNbXCJkZWZhdWx0XCJdOycpO1xuICAgIH0gZWxzZSBpZiAob3B0cy5jb21tb25qcykge1xuICAgICAgb3V0cHV0LmFkZCgndmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKFwiJyArIG9wdHMuY29tbW9uanMgKyAnXCIpOycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQuYWRkKCcoZnVuY3Rpb24oKSB7XFxuJyk7XG4gICAgfVxuICAgIG91dHB1dC5hZGQoJyAgdmFyIHRlbXBsYXRlID0gSGFuZGxlYmFycy50ZW1wbGF0ZSwgdGVtcGxhdGVzID0gJyk7XG4gICAgaWYgKG9wdHMubmFtZXNwYWNlKSB7XG4gICAgICBvdXRwdXQuYWRkKG9wdHMubmFtZXNwYWNlKTtcbiAgICAgIG91dHB1dC5hZGQoJyA9ICcpO1xuICAgICAgb3V0cHV0LmFkZChvcHRzLm5hbWVzcGFjZSk7XG4gICAgICBvdXRwdXQuYWRkKCcgfHwgJyk7XG4gICAgfVxuICAgIG91dHB1dC5hZGQoJ3t9O1xcbicpO1xuICB9XG5cbiAgb3B0cy50ZW1wbGF0ZXMuZm9yRWFjaChmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgIGxldCBvcHRpb25zID0ge1xuICAgICAga25vd25IZWxwZXJzOiBrbm93bixcbiAgICAgIGtub3duSGVscGVyc09ubHk6IG9wdHMub1xuICAgIH07XG5cbiAgICBpZiAob3B0cy5tYXApIHtcbiAgICAgIG9wdGlvbnMuc3JjTmFtZSA9IHRlbXBsYXRlLnBhdGg7XG4gICAgfVxuICAgIGlmIChvcHRzLmRhdGEpIHtcbiAgICAgIG9wdGlvbnMuZGF0YSA9IHRydWU7XG4gICAgfVxuXG4gICAgbGV0IHByZWNvbXBpbGVkID0gSGFuZGxlYmFycy5wcmVjb21waWxlKHRlbXBsYXRlLnNvdXJjZSwgb3B0aW9ucyk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgZ2VuZXJhdGluZyBhIHNvdXJjZSBtYXAsIHdlIGhhdmUgdG8gcmVjb25zdHJ1Y3QgdGhlIFNvdXJjZU5vZGUgb2JqZWN0XG4gICAgaWYgKG9wdHMubWFwKSB7XG4gICAgICBsZXQgY29uc3VtZXIgPSBuZXcgU291cmNlTWFwQ29uc3VtZXIocHJlY29tcGlsZWQubWFwKTtcbiAgICAgIHByZWNvbXBpbGVkID0gU291cmNlTm9kZS5mcm9tU3RyaW5nV2l0aFNvdXJjZU1hcChwcmVjb21waWxlZC5jb2RlLCBjb25zdW1lcik7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMuc2ltcGxlKSB7XG4gICAgICBvdXRwdXQuYWRkKFtwcmVjb21waWxlZCwgJ1xcbiddKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0ZW1wbGF0ZS5uYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignTmFtZSBtaXNzaW5nIGZvciB0ZW1wbGF0ZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5hbWQgJiYgIW11bHRpcGxlKSB7XG4gICAgICAgIG91dHB1dC5hZGQoJ3JldHVybiAnKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dC5hZGQoW29iamVjdE5hbWUsICdbXFwnJywgdGVtcGxhdGUubmFtZSwgJ1xcJ10gPSB0ZW1wbGF0ZSgnLCBwcmVjb21waWxlZCwgJyk7XFxuJ10pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gT3V0cHV0IHRoZSBjb250ZW50XG4gIGlmICghb3B0cy5zaW1wbGUpIHtcbiAgICBpZiAob3B0cy5hbWQpIHtcbiAgICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgICBvdXRwdXQuYWRkKFsncmV0dXJuICcsIG9iamVjdE5hbWUsICc7XFxuJ10pO1xuICAgICAgfVxuICAgICAgb3V0cHV0LmFkZCgnfSk7Jyk7XG4gICAgfSBlbHNlIGlmICghb3B0cy5jb21tb25qcykge1xuICAgICAgb3V0cHV0LmFkZCgnfSkoKTsnKTtcbiAgICB9XG4gIH1cblxuXG4gIGlmIChvcHRzLm1hcCkge1xuICAgIG91dHB1dC5hZGQoJ1xcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPScgKyBvcHRzLm1hcCArICdcXG4nKTtcbiAgfVxuXG4gIG91dHB1dCA9IG91dHB1dC50b1N0cmluZ1dpdGhTb3VyY2VNYXAoKTtcbiAgb3V0cHV0Lm1hcCA9IG91dHB1dC5tYXAgKyAnJztcblxuICBpZiAob3B0cy5taW4pIHtcbiAgICBvdXRwdXQgPSB1Z2xpZnkubWluaWZ5KG91dHB1dC5jb2RlLCB7XG4gICAgICBmcm9tU3RyaW5nOiB0cnVlLFxuXG4gICAgICBvdXRTb3VyY2VNYXA6IG9wdHMubWFwLFxuICAgICAgaW5Tb3VyY2VNYXA6IEpTT04ucGFyc2Uob3V0cHV0Lm1hcClcbiAgICB9KTtcbiAgICBpZiAob3B0cy5tYXApIHtcbiAgICAgIG91dHB1dC5jb2RlICs9ICdcXG4vLyMgc291cmNlTWFwcGluZ1VSTD0nICsgb3B0cy5tYXAgKyAnXFxuJztcbiAgICB9XG4gIH1cblxuICBpZiAob3B0cy5tYXApIHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKG9wdHMubWFwLCBvdXRwdXQubWFwLCAndXRmOCcpO1xuICB9XG4gIG91dHB1dCA9IG91dHB1dC5jb2RlO1xuXG4gIGlmIChvcHRzLm91dHB1dCkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMob3B0cy5vdXRwdXQsIG91dHB1dCwgJ3V0ZjgnKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhvdXRwdXQpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBhcnJheUNhc3QodmFsdWUpIHtcbiAgdmFsdWUgPSB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiBbXTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iXX0=