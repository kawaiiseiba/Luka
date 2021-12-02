
module.exports = {
    name: 'skip',
    description: 'Skip to the current song',
    type: 1,
    async execute(interaction, player, luka) {
        if (!interaction.member.voice.channel) {
            return await interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
            })
        }
    
        if (
            interaction.guild.me.voice.channelId &&
            interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
        ) {
            return await interaction.reply({
            content: 'You are not in my voice channel!',
            ephemeral: true,
            })
        }
    
        await interaction.deferReply()
        const queue = player.getQueue(interaction.guildId)
        if (!queue || !queue.playing) return await interaction.followUp({content: '❌ | No music is being played!'})

        const currentTrack = queue.current
        const success = queue.skip()
        return await interaction.followUp({ content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | **Something went wrong!**', })
    }
}