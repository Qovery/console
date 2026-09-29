// Run tests in a fixed timezone ahead of UTC so date handling that mixes local and UTC time is exercised
// on UTC CI runners too. Australia/Brisbane is UTC+10 and has no DST.
module.exports = () => {
  process.env.TZ = 'Australia/Brisbane'
}
