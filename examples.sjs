var dir = './';

exec `ls -lh {dir}` {
  if (err) {
    console.log('error', stderr);
  } else {
    console.log('success', stdout);
  }
}

var result = execSync `ls -lh {dir}`
