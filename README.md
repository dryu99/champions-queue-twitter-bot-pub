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
  - [x] store mods who post tweets in db (tracking for rewards?)
    - nah not for now, twitter can be our database lol (we're posting credits in tweets)
  - [x] add mod check
  - [x] make website for building commands
  - [x] figure out if we need more official twitch/twitter dev permissions
    - [ ] figure out which twitch account to use
    - [x] add dev + prod keys to env file
  - [ ] add validation for duplicate players in parse match message fn
  - [ ] add pngs to tweets (will get rid of embedded links too + save space)
    - [x] alternatively can just post thread and add twitch urls in replies
  - [x] add sentry
  - [ ] limit test (50 channels at once)
  - [ ] make it more scalable (rn we're just listening to all channels 24/7, we should prob stop listening once we know theyre in a game and relisten after 30 min)
  - [x] server side rendering for up to date cmd builder site??? or can just run a job to manually update json lmao 
  - [x] check these players
    - [x] XT camilo (needs to be added to site)
    - [x] WC CrazyGoose (needs to be added to site)
  - [x] add keyboard controls for cmd builder site
  - [x] how to prevent duplicate msgs when new streamers go live? (have to keep track of cache of existing matches?)
    - [x] can't really control this unless i enforce people use the website
  - [x] consider adding db name existence check back in (to prevent illegal names from being posted)
  - [x] when checking for duplicate tweets, should also try switching teams around (sometimes they mix it up?)
  - [ ] add cron job for restarts lol, sometimes the program doesn't exit??
  - [ ] check if streamer is playing cq (must have champions queue, cq, champ queue, etc in the title of their stream)
  - [ ] dm every cq streamer to let them know their mods can use this command to advertise their streams
    - [ ] dm peter dunn
  - [ ] MAKE THE SCREENSHOT THINGY WORK
  - [ ] go open source
    - [ ] remove mongodb and create an inline player db
    - [ ] make prs mandatory
- [ ] add team logo build script
- [ ] finish new tweet image service implementation
  - [ ] in tweet fn: TODO create html + save png + use png in tweet + delete png (maybe stream it?)
  - [ ] have to handle duplicates differently now since we cant use tweet text. save games in-memory? create hash based on summoner names?
    - [ ] we can restart periodically to avoid memory issues
    - [ ] is it okay to not persist map on restart? should be okay unless mods are tweeting >20 min apart
    - [ ] only other way to persist it to use db (which isn't an awful idea but would like to avoid doing that)

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

Pinned Tweet
- mention
  - cmd site builder
  - you can double check if the tweet has been posted by going to @ChampionsQueue
    - if your tweet hasn't been posted in ~3 minutes, you may have used incorrect names/formatting. Please use the cmd builder site and don't edit the generated command!


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


!editcom !teams 100 Closer / 100 Huhi / FLY Tomo / DARE Snow2 / 100 Gamsu | vs. | TSM Huni / DARE BMFX / MU Azog / DIG River / 100 Tenacity


HOW THE BOT WORKS
This bot is entirely community driven by Twitch mods! Whenever a mod enters the "!editcom !teams" command in a CQ streamer's Twitch chat, the bot validates the command and automatically tweets a live game update.

HOW TO CONTRIBUTE
Be a mod for your favourite CQ streamer (if you aren't a mod but would still like to contribute please DM us)
When a new game starts, use https://champions-queue-cmd-builder.vercel.app to fill out the teams and generate the Twitch command (see link in bio)
Enter command into chat
Check @ChampQueueBot to see your tweet!

Some things to keep in mind:
Please avoid editing the generated command (e.g. format, player names). If you make any changes, the bot will likely invalidate the command and won't tweet anything.
Only the first mod to set the command for a given game will trigger a tweet.

If you find any bugs or have any feedback please shoot us a DM!