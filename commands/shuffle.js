
module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue',
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
        if (!queue || !queue.playing) return void interaction.followUp({content: '❌ | No music is being played!'})
        try {
            queue.shuffle()
            trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str)
            return void interaction.followUp({
            embeds: [
                {
                color: 3092790,
                thumbnail: {
                    url: queue.guild.iconURL()
                },
                title: `Shuffled queue for ${queue.guild.name}`,
                description: trimString(
                    `__**Now Playing**:__\n[${queue.current.title}](${queue.current.url})\n\`${queue.current.duration} Requested by: ${queue.current.requestedBy.tag}\`\n 🎶 | ${queue}! `,
                    4095,
                ),
                },
            ],
            })
        } catch (error) {
            console.log(error)
            return void interaction.followUp({
            content: '❌ | Something went wrong!',
            })
        }
    }
}