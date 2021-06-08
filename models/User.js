const express = require('express')
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String, required: true, unique: true
    },
    BList: [{ type: Schema.Types.ObjectId, ref: 'List' }]
})
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);


