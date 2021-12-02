
module.exports = {
    name: 'clear',
    description: 'Clear the current queue',
    type: 1,
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
          if (!queue) return void interaction.followUp({ content: '❌ | No music in the queue!' })
          
          queue.clear()
          return await interaction.followUp({ content: '❌ | Queue cleared.' })
    }
}