import { asyncHandler } from "../utils/asyncHandler.js";
const registerUser =asyncHandler(async(req,res)=>
      {
            // 1.Get user name and password from frontend 
            //2.validation -> empty
            //3.check if user is already exist -username and password
            //4.check for images and avtar
            //5.upload them to cloudinary
            //6.create user object-entry in database 
            //7.remove password and refresh token from response 
            //8.check for user creation 
            //9.return response 


      })
export {registerUser}