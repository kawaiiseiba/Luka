const playdl = require('play-dl')

module.exports = {
    name: 'play',
    description: 'Play Youtube/Spotify music',
    type: 1,
    options: [
        {
            name: 'search',
            description: 'Search through youtube or use youtube/spotify links or playlist links',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, player, luka) {
        const query = interaction.options.getString('search')

        const vc = interaction.member.voice

        if(!vc.channelId) return await interaction.reply({ content: `${interaction.user.toString()} You need to be in a voice channel to play music!`, ephemeral: true })
        if (
            interaction.guild.me.voice.channelId &&
            interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
        ) {
            return await interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true, })
        }

        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            },
            leaveOnEmptyCooldown: 30000,
            async onBeforeCreateStream(track, source, _queue) {
                if (track.playlist?.source === "spotify") {
                    const searched = await playdl.search(`${track.title}`, { limit : 1 })
                    return (await playdl.stream(searched[0].url)).stream
                }
                return (await playdl.stream(track.url)).stream
            }
        })

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch {
            queue.destroy();
            return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true })
        }

        await interaction.deferReply()
        const searchResult = await player.search(query, {
            requestedBy: interaction.user
        }).catch(() => {})

        if (!searchResult || !searchResult.tracks.length) return await interaction.followUp({content: 'No results were found!'})


        await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`, })

        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0])
        if (!queue.playing) await queue.play()
    }
}