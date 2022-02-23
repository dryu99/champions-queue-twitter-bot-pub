# champions-queue-stream-updates-twitter-bot

TODOS
- think about how to reward volunteer mods
  - free publicity on tweets (twitch handle, twitter handle)
  - free RP looool
- CODE
  - setup players in db
  - figure out twitter api to post tweets
  - check how winter ward's twitter command is formatted

Workflow
- fetch all players with valid twitch username from DB
- assign event listener for chat msgs
  - if chat msg contains mod !teams setup command
    - parse match data (msg must be in specific format)
    - post to twitter (via twitter bot api)
    - stop listening to channel (part)
    - add channel to pending queue
- schedule interval job that loops through pending queue
  - if channel is live + playing league + in CQ
    - join channel (i.e. listen to incoming msgs)
    - remove channel from pending queue