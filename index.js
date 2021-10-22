require('dotenv').config()
const Discord = require('discord.js')

const luka = new Discord.Client({ 
  intents: [
    Discord.Intents.FLAGS.GUILDS, 
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_BANS, 
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    // Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    // Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    // Discord.Intents.FLAGS.DIRECT_MESSAGES,
    // Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    // Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ] 
})

const fetch = require('node-fetch')
const slashCommands = require('./modules/slash-commands')

const { Player } = require("discord-player")
const player = new Player(luka, {
  ytdlOptions: {
    quality: 'highest',
    filter: 'audioonly',
    highWaterMark: 1 << 25,
    dlChunkSize: 0
  }
})

const resetStatusActivity = () => {
  luka.user.setPresence(
    { 
      activities: [
        { 
          name: 'you 🎶', //▶︎Henceforth you 🎶
          type: 'PLAYING',
        }
      ],
      status: 'online'
    }
  )
}

player.on('error', (queue, error) => {
  console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`)
})

player.on('connectionError', (queue, error) => {
  console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`)
})

player.on("trackStart", (queue, track) => {
  luka.user.setPresence(
    { 
      activities: [
        { 
          name: track.title, //▶︎Henceforth
          type: 'LISTENING',
        }
      ],
      status: 'online'
    }
  )
  // queue.metadata.channel.send(`🎶 | Now playing **${track.title}** in **${queue.connection.channel.name}**!`)
  luka.guilds.cache.get('848169570954641438').channels.cache.get('890153344956514335').send(`🎶 | Now playing **${track.title}** in **${queue.connection.channel.name}**!\n${track.url}`)
})

player.on('trackAdd', (queue, track) => queue.metadata.channel.send(`🎶 | Track **${track.title}** queued!`))

player.on('trackEnd', (queue, track) => {
  resetStatusActivity()
})

player.on('botDisconnect', queue => {
  queue.metadata.channel.send('❌ | I was manually disconnected from the voice channel, clearing queue!')
  resetStatusActivity()
})

player.on('channelEmpty', queue => queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...'))

player.on('queueEnd', queue => {
  resetStatusActivity()
  queue.metadata.channel.send('✅ | **Queue finished!**')
})

luka.on('interactionCreate', async interaction => {
  try{
    if(!interaction.inGuild()) return
    if(!interaction.isCommand()) return
    
    const CMD = interaction.commandName

    if(CMD === `play`){
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

    } else if (CMD === `pause`){
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
        
      // return void interaction.followUp({
      //   content: success ? '▶ | Resumed!' : '❌ | Something went wrong!',
      // })
      const success = queue.setPaused(queue.connection.paused ? false : true)
      return await interaction.followUp({
        content: success ? queue.connection.paused ? '⏸ | **Paused!**' :  '▶ | **Resumed!**' : '❌ | **Something went wrong!**',
      })
    } else if (CMD === `queue`){
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
    } else if (CMD === `skip`){
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

      const currentTrack = queue.current;
      const success = queue.skip();
      return await interaction.followUp({ content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | **Something went wrong!**', })
      
    } else if (CMD === `skipto`){
      const position = interaction.options.getInteger('position')

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

      const reversePos = queue.tracks.reverse()
      const findingTrack = reversePos[position-1]

      queue.jump(findingTrack)
      return await interaction.followUp({ content: findingTrack ? `✅ | Skipped until **${queue.tracks[0]}**!` : '❌ | **Queue position does not exist!**' })
    } else if (CMD === `nowplaying`){
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
    } else if (CMD === `loop`){
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

      const success = queue.setRepeatMode(queue.repeatMode != 1 ? 1 : 0)
      return await interaction.followUp({
        content: success ? queue.repeatMode != 0 ? '🔂 | **Loop enabled!**' : '🚫 | **Loop disabled!**' : '❌ | Something went wrong!',
      })
    } else if (CMD === `loopqueue`){
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

      const success = queue.setRepeatMode(queue.repeatMode != 2 ? 2 : 0)
      return await interaction.followUp({
        content: success ? queue.repeatMode === 2 ? '🔁 | **Loop queue!**' : '🚫 | **Loop queue disabled!**' : '❌ | **Something went wrong!**',
      })

    } else if (CMD === `disconnect`){
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

      queue.destroy()
      return await interaction.followUp({ content: '👍 | **Disconnected!**' })
    }

  } catch(e) {
    console.log(e)
  }
})

luka.once('ready', async () => {
  resetStatusActivity()

  // await slashCommands(luka)
  const datenow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
  console.log(`Luka went online~\nDate: ${datenow}`)
})

luka.once('reconnecting', () => {
  console.log('Reconnecting!')
})

luka.once('disconnect', () => {
  console.log('Disconnect!')
})

luka.login(process.env.MegurineLuka)