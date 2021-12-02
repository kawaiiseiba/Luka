
module.exports = {
    name: 'pause',
    description: 'Pause the current song',
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
      
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId)
        if (!queue || !queue.playing)
            return void interaction.followUp({
                content: '❌ | No music is being played!',
            })
    
        const success = queue.setPaused(queue.connection.paused ? false : true)
            return await interaction.followUp({
                content: success ? queue.connection.paused ? '⏸ | **Paused!**' :  '▶ | **Resumed!**' : '❌ | **Something went wrong!**',
        })
    }
}