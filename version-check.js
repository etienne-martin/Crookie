const semver = require('semver');

try {
  const current = semver.valid(process.version);
  const target = semver.valid('6.10.0');

  if (semver.lt(current, target)) {
    console.error('\x1b[31m%s\x1b[0m', 'You are using node ' + process.version + '. Please upgrade to node > 6.10 to run this project.');
    process.exit(1);
  }
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', 'You are using node ' + process.version + '. Please upgrade to node > 6.10 to run this project.');
  process.exit(1);
}

process.exit(0);
