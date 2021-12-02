
module.exports = {
    name: 'nowplaying',
    description: `See what's currently being played`,
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

        const current = queue.current

        const embed = {
            author: {
                name: `Now Playing`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            },
            title: current.title,
            url: current.url,
            color: 3092790,
            thumbnail: {
                url: current.thumbnail,
            },
            fields: [
                {
                    name: `Channel`,
                    value: current.author,
                    inline: true
                },
                {
                    name: `Duration`,
                    value: current.duration,
                    inline: true
                },
            ],
            footer: {
                iconURL: current.requestedBy.displayAvatarURL({ dynamic: true }),
                text: `Requested by: ${current.requestedBy.tag}`
            }
        }

        return await interaction.followUp({ embeds: [embed] })
    }
}