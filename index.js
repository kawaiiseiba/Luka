require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const Client = require('./client/Client')

const luka = new Client()
luka.commands = new Discord.Collection()

const mongoose = require('mongoose')
mongoose.connect(process.env.AkashicRecords, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})

const GAMES_VC = require('./schemas/games_voice')

const db = mongoose.connection
db.on('error', e => console.log({ message: e.message }))

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  luka.commands.set(command.name, command);
}

const slashCommands = require('./modules/slash-commands')

const { Player, QueueRepeatMode } = require("discord-player")
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

    const command = luka.commands.get(SUB_COMMANDS)
    command.execute(interaction, player, luka)    

  } catch(e) {
    console.log(error);
    interaction.followUp({
      content: 'There was an error trying to execute that command: ' + error.message,
    })
  }
})


luka.on('voiceStateUpdate', async (oldState, newState) => {
  try{
    const altria = luka.guilds.cache.get('848169570954641438')
    const member = altria.members.cache.get(newState.id)
    const voiceState = member.voice
    const presence = member.presence
    const user = member.user

    const games_vc = await GAMES_VC.find()

    if(user.bot) return 

    const queue = player.getQueue(altria.id)
    if(!queue) return
    const current = queue.current
    const tracks = queue.tracks 

    if(!voiceState) return
    if(!voiceState.channel) {
      if(tracks.length < 1) return

      const hasRequest = tracks.find(track => track.requestedBy.id === user.id)

      if(!hasRequest) return // No Request Found

      const requestedTracks = tracks.filter(track => track.requestedBy.id !== user.id)

      if(requestedTracks.length < 1) { // Request from other users
        queue.destroy()
        if(queue.destroyed) return console.log("Cannot go further because the queue is destroyed")
        return
      }

      queue.clear()
      queue.addTracks(requestedTracks)
      const skippable = current.requestedBy.id === user.id ? queue.skip() : false

      if(!skippable) return

      const prevTrack = queue.previousTracks.length !== 0 ? queue.previousTracks[0] : false

      if(!prevTrack) return

      if(prevTrack.requestedBy.id === user.id) {
        const getPos = queue.getTrackPosition(prevTrack)

        if(getPos === -1) return

        return queue.remove(getPos)
      }
    }

    if(oldState.channelId === newState.channelId) return

    const inFarSide = games_vc.find(data => data.vc === voiceState.channel.id)
    if(!inFarSide) return

    if(current.requestedBy.id !== user.id) return

    const vcToJoin = altria.channels.cache.get(voiceState.channel.id)
    return altria.me.voice.setChannel(vcToJoin)
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
  // const MANAGER_CMD = await GUILD.commands.fetch('915845240445886484')

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