# Redis Usage

All values have expirations, so no removing is ever done.

## Session Set

`sessions` -> a set of all active sessions

## Each Session is a Hash

With the properties:
```
users: set of ids

for each uid in users:
  uid:
    name: String
    // capabilities: String

  location-uid: Number
  volume-uid: Number

for each pair of uids:
  uid1-uid2: attenuation or null for no connection
```
