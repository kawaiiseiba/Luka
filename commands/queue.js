
module.exports = {
    name: 'queue',
    description: 'Shows all currently enqueued songs',
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

        const upNext = queue.tracks.map((v,i) => {
            return `\`${i+1}.\` [${v.title}](${v.url})\n\`${v.duration} Requested by: ${v.requestedBy.tag}\``
        })

        // console.log(current)
        // console.log(upNext)

        const embed = {
            title: `Queue for ${queue.guild.name}`,
            color: 3092790,
            description: `__**Now Playing**:__\n[${current.title}](${current.url})\n\`${current.duration} Requested by: ${current.requestedBy.tag}\`\n${upNext.length != 0 ? `__**Up Next**:__\n${upNext.join('\n\n')}` : ''}`,
            thumbnail: {
            url: queue.guild.iconURL()
            },
            footer: {
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            text: `Loop: ${queue.repeatMode === 1 ? '✅' : '❌' } | Queue Loop: ${queue.repeatMode === 2 ? '✅' : '❌' }`
            }
        }

        return await interaction.followUp({ embeds: [embed] })
    }
}