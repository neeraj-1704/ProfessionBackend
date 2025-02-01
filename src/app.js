import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
// cors cross origin resource mostly use for the taking req from front end

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}));

app.use(express.json({limit: "16kb"}));  // pass the incoming into the json formate
app.use(express.urlencoded({extended:true,limit: "16kb" })); // url data convert the encoded to req.body (object) to acess
app.use(express.static('public'));
app.use(cookieParser());

// import the router package declaration not on top should be in the bottom
// routes
import userRouter from './routes/user.routes.js';

// routes declarartion
// we separate the controller and router so that way we are loading the all router here we are using the use() method
app.use("/api/v1/users/", userRouter)
//  api/v1/users//register
export { app }

 