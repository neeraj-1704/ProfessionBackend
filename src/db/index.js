import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async () => {
    try{

      const conectionInstant = await mongoose.connect(`${process.env.MONGODB_URL} / ${DB_NAME}`)

      console.log(`\n MongoDB connected !! DB HOST: ${conectionInstant.connection.host} `)
    }catch(error){
        console.log("MongoDB connection error",error);
        process.exit(1);
    }
}

export default connectDB;