import { User } from "../models/user.model.js";
import asyncHandler from '../path/to/asyncHandler'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

// genrating the access and the refresh tokens

const generateRefreshAndAcessToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wroung whilte genrating refresh token and access toekn");

    }

}

// register page
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message:"ok i am working fine"
    // })

    const { fullname, email, username, password } = req.body
    console.log("email: ", email);

    //two way methods
    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is req")

    // }

    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        //operator
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User  with the email or username already exits")
    }

    // taking the path of the video or file from the multer 
    // store in the avatarLoacalPAth
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // passing the data from the ui to database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createduser) {
        throw new ApiError(500, "some thing wroung when the register time")
    }

    return res.status(201).json(
        new ApiResponce(200, createduser, "User register Successfully")
    )

})

// login page
// req body data fetch
// check the username or email 
// find the user from the database
// if find the user check password
// access and refresh token 
// send the data cookies

const loginUser = asyncHandler(async (req, res) => {

    const { email, password, username } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username and email is required")
    }
    // using the await because data is getting some to time load 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError("User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials of the user")
    }

    //access and refresh token
    const { accessToken, refreshToken } = await
        generateRefreshAndAcessToken(user._id)

    // sending the above both token in the cookies
    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken


                },
                "User logged in Successfully"
            )
        )


})

// logout user

const logoutUser = asyncHandler (async(req,res) =>{

    User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken: undefined
            }
        },{
            new :true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",accessToken,options)
    .clearCookie("refreshToken",refreshToken,options)
    .json(new ApiResponce(200,{},"User logged out"))

})


// access token after refresh 
const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unthrized request");
    }

   try {
    const decodedToken =  jwt.verify(incomingRefreshToken,
         process.env.ACCESS_TOKEN_SECRET
         )
     const user =await User.findById(decodedToken?._id)
 
     if(!user){
         throw new ApiError(401,"Invalid refresh token")
     }
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or  used")
     }
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
  const {accessToken, newRefreshToken}=   await generateRefreshAndAcessToken(used._id)
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
 
         new ApiResponce (
             200
             ,{accessToken, refreshToken:newRefreshToken}
             ,"Access Token refreshed "
         )
 
    )
   } catch (error) {

    throw new ApiError(401, error?.message || "Invalid Refresh token")
    
   }
})

// understand the payload data concepts
export { registerUser, loginUser, logoutUser, refreshAccessToken}