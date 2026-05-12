# Stop Playing Note

## What does this block do?
This block instantly stops any sound that the micro:bit is currently playing. 

## How does it work?
When the micro:bit reads this block, it sends a command to turn off the speaker. If you map this block to a button's "released" event, it will make sure the music only plays while you are holding the button down.

## Why would you use it?
When you play a continuous note inside a `forever` loop, you need a way to make it stop so the song doesn't play forever! This block acts as the "off switch" for your musical instrument.
