# champions-queue-stream-updates-twitter-bot

TODOS
- think about how to reward volunteer mods
  - free publicity on tweets (twitch handle, twitter handle)
  - free RP looool
  - raffle (ask riot to put in rp)
- How to handle 
  - abusers/troll mods?
    - 
  - mistake inputs?
    - can just validate on server
      - bad format
      - invalid player names
- Cons of listening to streams vs sending periodic !team msgs
  - not scalable if many streams
  - how to handle players playing league but not CQ?
  - how to handle players with no nightbot setup? (we will keep listening until the end of time)
- CODE
  - setup players in db
  - figure out twitter api to post tweets
  - check how winter ward's twitter command is formatted
  - has to be running at certain times

Workflow
- fetch all players with valid twitch username from DB
- assign event listener for chat msgs
  - if chat msg contains mod !teams setup command (must verify modm)
    - parse match data (msg must be in specific format)
    - post to twitter (via twitter bot api)
    - stop listening to channel (part)
    - add channel to pending queue
- schedule interval job that loops through pending queue
  - if channel is live + playing league + in CQ
    - join channel (i.e. listen to incoming msgs)
    - remove channel from pending queue

!editcom !teams come back on march 13th