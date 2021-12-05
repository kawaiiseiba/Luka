const mongoose = require('mongoose')

const games_vc = new mongoose.Schema({
  game: {
    type: String,
    required: true
  },
  vc: {
    type: String,
    required: true
  }
}, { collection: 'game_vc' })

module.exports = mongoose.model('GamesVC', games_vc)