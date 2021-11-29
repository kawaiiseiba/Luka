
const { QueueRepeatMode } = require('discord-player')

module.exports = async luka => {

    // await luka.api.applications(luka.user.id).guilds('848169570954641438').commands('914901387974963240').delete()

    // await luka.api.applications(luka.user.id).guilds('848169570954641438').commands.post({
    //     data: {
    //         name: "megu",
    //         description: "Play songs at your command",
    //         default_permission: false,
    //         options: [
    //             {
    //                 name: 'back',
    //                 type: 1,
    //                 description: 'Play the previous track'
    //             },
    //             {
    //                 name: 'clear',
    //                 type: 1,
    //                 description: 'Clear the current queue'
    //             },
    //             {
    //                 name: 'help',
    //                 type: 1,
    //                 description: `Shows information about available commands`
    //             },
    //             {
    //                 name: 'follow',
    //                 type: 1,
    //                 description: `Follows you to a voice channel you're connected to`
    //             },
    //             {
    //                 name: 'jump',
    //                 type: 1,
    //                 description: 'Jump to a specific track',
    //                 options: [
    //                     {
    //                         name: 'tracks',
    //                         description: 'The number of tracks to skip',
    //                         type: 4,
    //                         required: true
    //                     }
    //                 ]
    //             },
    //             {
    //                 name: 'loop',
    //                 type: 1,
    //                 description: 'Set loop mode',
    //                 options: [
    //                     {
    //                         name: 'mode',
    //                         type: 4,
    //                         description: 'Loop type',
    //                         required: true,
    //                         choices: [
    //                             {
    //                                 name: 'Off',
    //                                 value: QueueRepeatMode.OFF,
    //                             },
    //                             {
    //                                 name: 'Track',
    //                                 value: QueueRepeatMode.TRACK,
    //                             },
    //                             {
    //                                 name: 'Queue',
    //                                 value: QueueRepeatMode.QUEUE,
    //                             },
    //                             {
    //                                 name: 'Autoplay',
    //                                 value: QueueRepeatMode.AUTOPLAY,
    //                             },
    //                         ]
    //                     },
    //                 ]
    //             },
    //             {
    //                 name: 'nowplaying',
    //                 type: 1,
    //                 description: `See what's currently being played`
    //             },
    //             {
    //                 name: 'pause',
    //                 type: 1,
    //                 description: 'Pause the current song'
    //             },
    //             {
    //                 name: 'play',
    //                 description: 'Play Youtube/Spotify music',
    //                 type: 1,
    //                 options: [
    //                     {
    //                         name: 'search',
    //                         description: 'Search through youtube or use youtube/spotify links or playlist links',
    //                         type: 3,
    //                         required: true
    //                     }
    //                 ]
    //             },
    //             {
    //                 name: 'playnext',
    //                 description: 'Add a song to the top of the queue',
    //                 type: 1,
    //                 options: [
    //                     {
    //                         name: 'search',
    //                         description: 'Search through youtube or use youtube/spotify links or playlist links',
    //                         type: 3,
    //                         required: true
    //                     }
    //                 ]
    //             },
    //             {
    //                 name: 'queue',
    //                 type: 1,
    //                 description: 'Shows all currently enqueued songs'
    //             },
    //             {
    //                 name: 'remove',
    //                 type: 1,
    //                 description: 'Remove a specific track',
    //                 options: [
    //                     {
    //                       name: 'track',
    //                       type: 4,
    //                       description: 'The track number you want to remove',
    //                       required: true
    //                     }
    //                 ]
    //             },
    //             {
    //                 name: 'resume',
    //                 type: 1,
    //                 description: 'Resume the current song'
    //             },
    //             {
    //                 name: 'shuffle',
    //                 type: 1,
    //                 description: 'Shuffle the queue'
    //             },
    //             {
    //                 name: 'skip',
    //                 type: 1,
    //                 description: 'Skip to the current song'
    //             },
    //             {
    //                 name: 'stop',
    //                 type: 1,
    //                 description: 'Luka will stop playing'
    //             },
    //             {
    //                 name: 'disconnect',
    //                 type: 1,
    //                 description: 'Luka will disconnect from the voice channel'
    //             }
    //         ]
    //     }
    // })

    console.log(await luka.api.applications(luka.user.id).guilds('848169570954641438').commands.get())
    
}