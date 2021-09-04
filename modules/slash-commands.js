
module.exports = async luka => {

    const commandsArr = [
        {
            name: 'play',
            description: 'Play Youtube/Spotify music',
            options: [
                {
                    name: 'search',
                    description: 'Search through youtube or use youtube/spotify links',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'pause',
            description: 'Pause the current playing track'
        },
        {
            name: 'pause',
            description: 'Pause the current playing track'
        },
        {
            name: 'queue',
            description: 'Shows all currently enqueued songs'
        },
        {
            name: 'nowplaying',
            description: 'Shows all currently enqueued songs'
        },
        {
            name: 'loop',
            description: 'Toggles looping the currently playing songs'
        },
        {
            name: 'loopqueue',
            description: 'Toggles looping the entire song'
        },
        {
            name: 'skip',
            description: 'Toggles the currently playing song'
        },
        {
            name: 'skipto',
            description: 'Skips to a certain position in the queue',
            options: [
                {
                    name: 'position',
                    description: 'Position of the song in the queue',
                    type: 4,
                    required: true
                }
            ]
        },
        {
            name: 'disconnect',
            description: 'Disconnect Luka from the voice channel'
        }
    ]

    // commandsArr.map(i => {
    //     setTimeout(async () => {
    //         await luka.api.applications(luka.user.id).commands.post({
    //             data: i
    //         }).then(console.log)
    //         .catch(console.error)
    //     }, 3000)
    // })

    console.log(await luka.api.applications(luka.user.id).commands.get())
    
}