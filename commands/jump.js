
module.exports = {
    name: 'jump',
    type: 1,
    description: 'Jump to a specific track',
    options: [
        {
            name: 'tracks',
            description: 'The number of tracks to skip',
            type: 4,
            required: true
        }
    ],
    async execute(interaction, player, luka) {
        if (!interaction.member.voice.channel) {
            return void interaction.reply({
              content: 'You are not in a voice channel!',
              ephemeral: true,
            })
          }

        if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
        ) {
            return void interaction.reply({
                content: 'You are not in my voice channel!',
                ephemeral: true,
            })
        }

        await interaction.deferReply()

        const queue = player.getQueue(interaction.guildId)
        if (!queue || !queue.playing) return void interaction.followUp({ content: '❌ | No music is being played!' })
        
        const trackIndex = interaction.options.getInteger('tracks') - 1
        if (trackIndex > queue.tracks.length) return void interaction.followUp({ content: '❌ | Track number greater than queue depth!' })

        const trackName = queue.tracks[trackIndex].title
        queue.jump(trackIndex)

        return await interaction.followUp({ content: `⏭ | **${trackName}** has jumped the queue!` })
    }
}