const express = require("express");
const router = express.Router();
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js";



router.route("/register").post(
    // avatar and coverImages will directly store in the multer separarely
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
       
    ])
    , registerUser);

router.route("/login").post(loginUser)

export default router; 