// file naming use acc to the standards user.model.js 

import mongoose, { Mongoose, Schema } from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
        index: true,  // serching field enable by the indes
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // service url like aws, cloulnary
        required: true,

    },
    coverImage: {
        type: String // url pf the images   
    },

    watchHistory: [{
        type: Schema.type.ObjectId,
        ref: "video",

    }
    ],
    password: {
        type: String,
        required: [true, 'Passwoed is req']

    },

    refreshToken: {
        type: String
    }

}, {
    timestamps: true
}
)

// pre hooks sre used fro the just before data save in DB start workinng 
// suppose we have to store the pass word in encrypted formate at that time pre hook come in picture
userSchema.pre("save", async function (next){
    // here we are using the if condtion because without conditrion for every req it will change the pass in encrytp from to avoid we using the condtions
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password ,10)
    next()
})


//custom methods in user schema

userSchema.methods.isPasswordCorrect = async function 
(password){
     return await bcrypt.compare(password, this.password);
}

// genrating the access token
userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}

// genratig  the refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
export const User = mongoose.model("User", userSchema)