const { tap } = require("rxjs/operators");

const log = (tag) =>
  tap(emission => {
    console.log(`${tag} - Logging emission: `, JSON.stringify(emission, null, 2));
  });

module.exports = log;