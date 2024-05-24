import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/clodinary.js";
import User from "..models/users.models.user.js";
import {ApiError} from "..utils/ApiError.js";
import {ApiResponse} from "..utils/ApiResponse.js";
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
            const {fullname ,email,password,username}=req.body;
            console.log("Email:",email)

           if(
            [email,fullname,password,username].some((fields)=>
                  fields?.trim()==="")
            )
           {
            throw new ApiError(400,"All field are required")
           }

           const Existinguser=User.findone({
            $or:[{username},{email}]
           })
           if(Existinguser){
            throw new ApiError(409,"Already user exists")
           }
           const avtarlocalpath=req.files?.avtar[0]?.path
           const CoverImagelocalpath=req.files?.avtar[0]?.path
           const avtar=await uploadOnCloudinary(avtarlocalpath)
           const coverImage= await uploadOnCloudinary(CoverImagelocalpath)
           if(!avtar){
            throw new ApiError(409,"Avtar is required")
           }

           const user = await User.create(
            {
                  fullname,
                  avtar:avtar.url,
                  coverImage:coverImage?.url|| "",
                  password,
                  email,
                  username:username.toLowerCase()
            })
            const createUser= User.findById(user.id).select(
                  "-password -refreshToken"
            )
            if(!createUser){
                  throw new ApiError(500,"Something went wrong while registering the user")
            }
            return res.status(201).json(
                  new ApiResponse(200,createUser,"User Registred succesfully")
            )
      })
export {registerUser}