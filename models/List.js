
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ListSchema = new Schema({
            user: String,
            id: Number,
            name: String,
            rating: Number,
            status: String,
            image: String,
            Stype : String,
            siteURL : String,
            genres : [String],
            plot: String,
            language: String
})

module.exports = mongoose.model('List' , ListSchema)