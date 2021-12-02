const playdl = require('play-dl')

module.exports = {
    name: 'playnext',
    description: 'Add a song to the top of the queue',
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
  
        await interaction.deferReply();
  
        const query = interaction.options.getString('search')
        const searchResult = await player
          .search(query, {
            requestedBy: interaction.user
          })
          .catch(() => {})

        if (!searchResult || !searchResult.tracks.length)
          return void interaction.followUp({content: 'No results were found!'});
  
        const queue = player.createQueue(interaction.guild, {
          metadata: {
            channel: interaction.channel
          },
          leaveOnEmptyCooldown: 30000,
          async onBeforeCreateStream(track, source, _queue) {
            if (source === "youtube" || source === "spotify") return (await playdl.stream(track.url)).stream
          }
        })
  
        try {
          if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        } catch {
          void player.deleteQueue(interaction.guildId)
          return void interaction.followUp({
            content: 'Could not join your voice channel!',
          })
        }
  
        await interaction.followUp({
          content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`,
        });
        searchResult.playlist ? queue.insert(searchResult.tracks, 0) : queue.insert(searchResult.tracks[0], 0)
        if (!queue.playing) await queue.play()
    }
}