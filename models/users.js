const mongoose = require("mongoose");
const passport = require("passport");
const Schema = mongoose.Schema;
const passportLocalMoongoose = require("passport-local-mongoose")
const userSchema = new Schema({
    email:{
        type:String, 
        require: true
    }
})
userSchema.plugin(passportLocalMoongoose);
module.exports = mongoose.model("User",userSchema)