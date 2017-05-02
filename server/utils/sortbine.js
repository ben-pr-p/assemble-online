module.exports = uid1 => uid2 =>
  (uid1 != uid2 ? [uid1, uid2].sort().join('-') : undefined)
