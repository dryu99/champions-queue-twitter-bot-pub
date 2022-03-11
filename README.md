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
  - [x] setup players in db
  - [x] figure out twitter api to post tweets
  - [x] check how winter ward's twitter command is formatted
  - [x] how to handle multiple players streaming in one match 
  - [x] deploy app (vps)
  - [x] figure out scheduling for app (cron)
  - [ ] add pngs to tweets (will get rid of embedded links too + save space)
    - [x] alternatively can just post thread and add twitch urls in replies
  - [x] store mods who post tweets in db (tracking for rewards?)
    - nah not for now, twitter can be our database lol (we're posting credits in tweets)
  - [x] add mod check
  - [ ] make website for building commands
  - [ ] figure out if we need more official twitch/twitter dev permissions
    - [ ] figure out which twitch account to use
    - [ ] add dev + prod keys to env file

Workflow
- currently our server wakes up every 15 seconds to check if CQ is live (going by 10am/6pm - 1am blocks)
  - if it isn't, go back to sleep
  - if it is continue with workflow
  - ideally we would want to use a cron job but pm2 is being dumb, maybe try docker (stretch)
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


example tweet:
 
Version 12.5
 
TOP Lourlo - twitch.tv/lourlo
JGL Xmithe 
MID PowerofEvil - twitch.tv/lourlo
BOT Doublelift
SUP CoreJJ

vs

TOP Lourlo
JGL Xmithe - twitch.tv/lourlo
MID PowerofEvil
BOT Doublelift
SUP CoreJJ


!editcom !teams Lourlo / TL Armao / GG ry0ma / EG Kaori / TSM Shenyi | vs. | TL Bwipo / DNHA Svmmy / BOG rjs / CLG Luger / EST Mia