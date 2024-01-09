import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloud} from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.js";
import { ApiResponce } from "../utils/ApiResponce.js";
const registerUser = asyncHandler(async (req,res )=>{
    // res.status(200).json({
    //     message:"ok i am working fine"
    // })

    const{fullname, email,username,password} = req.body
    console.log("email: ",email);

    //two way methods
    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is req")

    // }

    if(
        [fullname, email,username,password].some((field) =>
            field?.trim() === "")
     ){
        throw new ApiError(400, "All fields are required");
     }
     
    const existedUser = User.findOne({
        //operator
        $or:[{ username },{ email }]
     })

     if(existedUser){
        throw new ApiError(409, "User  with the email or username already exits")
     }

     // taking the path of the video or file from the multer 
     // store in the avatarLoacalPAth
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

   const avatar =  await uploadOnCloud(avatarLocalPath);
   const coverImage = await uploadOnCloud(coverImageLocalPath);

   if(!avatar){
    throw new ApiError(400,"Avatar file is required")
   }
   // passing the data from the ui to database
   const user =await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createduser){
    throw new ApiError(500,"some thing wroung when the register time")
   }

   return res.status(201).json(
        new ApiResponce(200, createduser,"User register Successfully")
   )

})


export {registerUser}