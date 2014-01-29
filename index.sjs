macro interpolate {
  case { _ $template:expr } => {

    var ctx = #{$template}[0].context;

    function _copyCtx(tokens, ctx) {
      for (var i = 0, len = tokens.length; i < len; i++) {
        tokens[i].context = ctx;
        if (tokens[i].token.inner) {
          _copyCtx(tokens[i].token.inner, ctx);
        }
      }
    }

    function read(code) {
      var toks = parser.read(code);
      toks.pop();
      _copyCtx(toks, ctx);
      return toks;
    }

    function splitParts(str) {
      var current = '';
      var parts = [];
      var deep = 0;

      for (var i = 0, len = str.length; i < len; i++) {
        if (str[i] === '{') {
          deep += 1;
          if (deep === 1) {
            parts.push(current);
            current = '';
          } else {
            current += str[i];
          }
        } else if (str[i] === '}') {
          deep -= 1;
          if (deep === 0) {
            parts.push({code: current});
            current = '';
          } else {
            current += str[i];
          }
        } else {
          current += str[i];
        }
      }

      parts.push(current);
      current = '';

      return parts;
    }

    function annotateParts(parts) {
      var id = 0;
      return parts.map(function(part) {
        if (part.code) {
          part = {code: part.code, id: '__sweet_exec_id__' + (id++)};
        }
        return part;
      });
    }

    function buildMapping(parts) {
      var mapping = {};
      parts.forEach(function(part) {
        if (part.id && part.code) {
          mapping[part.id] = part.code;
        }
      });
      return mapping;
    }

    function joinParts(parts, mapping) {
      return parts.map(function(part) {
        return part.id ? '+' + part.id + '+' : JSON.stringify(part);
      }).join('');
    }

    var template = #{$template}[0].token.value.raw;
    var parts = annotateParts(splitParts(template));
    var mapping = buildMapping(parts);

    var src = joinParts(parts).replace(
      /__sweet_exec_id__[0-9]+/g,
      function(id) {
        return mapping[id]
      });

    return read(src);
  }
}

let exec = macro {
  case { _ $cmd:expr { $body ... } } => {

    // inject identifiers into callback's scope
    letstx $err = [makeIdent('err', #{$body ...}[0])];
    letstx $stdout = [makeIdent('stdout', #{$body ...}[0])];
    letstx $stderr = [makeIdent('stderr', #{$body ...}[0])];

    return #{
      require('child_process').exec(
        interpolate $cmd ,
        function($err, $stdout, $stderr) {
          $body ...
        });
    };
  }
  case { _ } => { return #{exec} }
}

let execSync = macro {
  rule { $cmd:expr } => {
    require('execSync').exec(interpolate $cmd)
  }
  rule { } => { }
}

export exec;
export execSync;
