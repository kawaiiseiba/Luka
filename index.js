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

const slashCommands = require('./modules/slash-commands')

const { Player, QueueRepeatMode } = require("discord-player")
const playdl = require('play-dl')
const player = new Player(luka)
// const player = new Player(luka, {
//   ytdlOptions: {
//     quality: 'highest',
//     filter: 'audioonly',
//     highWaterMark: 1 << 25,
//     dlChunkSize: 0
//   }
// })

const resetStatusActivity = () => {
  luka.user.setPresence(
    { 
      activities: [
        { 
          name: `you 🎶`, //▶︎Henceforth you 🎶
          type: 'LISTENING',
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
  queue.skip()
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

player.on('botDisconnect', (queue, track) => {
  queue.metadata.channel.send('❌ | I was manually disconnected from the voice channel, clearing queue!')
  resetStatusActivity()
})

player.on('channelEmpty', (queue, track) => queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...'))

player.on('queueEnd', (queue, track) => {
  resetStatusActivity()
  queue.metadata.channel.send('✅ | **Queue finished!**')
})

luka.on('interactionCreate', async interaction => {
  try{
    if(!interaction.inGuild()) return
    if(!interaction.isCommand()) return
    if(interaction.commandName !== `megu`) return
    
    const SUB_COMMANDS = interaction.options.getSubcommand()

    if (SUB_COMMANDS === `back`) {
      try {
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

        const success = await queue.back()
        return await interaction.followUp({ content: success ? '✅ | Playing the previous track!' : '❌ | **Something went wrong!**', })

      } catch (error) {
        console.log(error);
        interaction.followUp({
          content: 'There was an error trying to execute that command: ' + error.message,
        })
      }
        
    } else if (SUB_COMMANDS === `clear`) {
      try {
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

      } catch (error) {
        console.log(error);
        interaction.followUp({
          content: 'There was an error trying to execute that command: ' + error.message,
        })
      }
    } else if (SUB_COMMANDS === `follow`) {
      return await interaction.reply({ content: `Feature to be added.`})
    } else if (SUB_COMMANDS === `help`) {
      return await interaction.reply({ content: `Feature to be added.`})
    } else if (SUB_COMMANDS === `jump`) {

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
      
    } else if (SUB_COMMANDS === `loop`) {
      try {
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
        if (!queue || !queue.playing) {
          return void interaction.followUp({content: '❌ | No music is being played!'})
        }
  
        const loopMode = interaction.options.get('mode').value
        const success = queue.setRepeatMode(loopMode)
        const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶'
  
        return void interaction.followUp({
          content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!',
        })

      } catch (error) {
        console.log(error)
        interaction.followUp({
          content: 'There was an error trying to execute that command: ' + error.message,
        })
      }
    } else if (SUB_COMMANDS === `nowplaying`) {

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

    } else if (SUB_COMMANDS === `pause`) {
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

    } else if (SUB_COMMANDS === `play`){
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
          async onBeforeCreateStream(track, source, _queue) {
            if (source === "youtube") {
              return (await playdl.stream(track.url)).stream
            }
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
    
    } else if (SUB_COMMANDS === `playnext`) {
      try {
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
          async onBeforeCreateStream(track, source, _queue) {
            if (source === "youtube") {
              return (await playdl.stream(track.url)).stream
            }
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

      } catch (error) {
        console.log(error);
        interaction.followUp({
          content: 'There was an error trying to execute that command: ' + error.message,
        })
      }
      
    } else if (SUB_COMMANDS === `queue`){
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
    } else if (SUB_COMMANDS === `remove`){
      
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

      const number = interaction.options.getInteger('track') - 1

      if (number > queue.tracks.length) return void interaction.followUp({ content: '❌ | Track number greater than queue depth!' })

      const removedTrack = queue.remove(number)
      return void interaction.followUp({
        content: removedTrack ? `✅ | Removed **${removedTrack}**!` : '❌ | Something went wrong!',
      })

    } else if (SUB_COMMANDS === `resume`){
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
      
      const success = queue.setPaused(false)
      return void interaction.followUp({
        content: success ? '▶ | Resumed!' : '❌ | Something went wrong!',
      })

    } else if (SUB_COMMANDS === `shuffle`){
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

    } else if (SUB_COMMANDS === `skip`){
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

    } else if (SUB_COMMANDS === `stop`){

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

      queue.destroy()
      return void interaction.followUp({content: `🛑 | ${luka.user.username} stopped playing!`})

    } else if (SUB_COMMANDS === `disconnect`){
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

  /*************************************
  *
  *  ADDING SLASH COMMAND PERMISSIONS
  *
  *************************************/

  // const GUILD = luka.guilds.cache.get('848169570954641438')
  // const MANAGER_CMD = await GUILD.commands.fetch('914917434157334589')

  // const manager_permissions = {
  //   id: '908962125546934312',
  //   type: 'ROLE',
  //   permission: true,
  // }

  // MANAGER_CMD.permissions.add({ permissions: [manager_permissions] }).then(console.log)

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