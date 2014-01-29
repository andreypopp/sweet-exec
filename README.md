# sweet-exec

Syntax extension (made with [Sweet.js][sjs]) for executing shell commands using
`child_process.exec(...)` function:

    var dir = './';

    exec `ls -lh {dir}` {
      if (err) {
        console.log('error', stderr);
      } else {
        console.log('success', stdout);
      }
    }

and synchronously via `execSync` npm module:

    var result = execSync `ls -lh {dir}`

[sjs]: http://sweetjs.org
