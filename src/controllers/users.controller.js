import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/clodinary.js";
import {User} from "../models/users.models.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from the request body
    const { fullName, email, password, username } = req.body;
    console.log("Email:", email);

    // 2. Validate input fields
    if ([email, fullName, password, username].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if the user already exists
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // 4. Handle avatar and cover image upload
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    
    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    // 5. Create user object and save to database
    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // 6. Fetch the created user excluding password and refreshToken
    const createdUser = await User.findById(user.id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 7. Return successful response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Ensure req.user is defined
        if (!(req.user ||req.user._id)) {
            throw new ApiError(400, "User is not authenticated");
        }

        // Log the user ID for debugging
        console.log("Logging out user with ID:", req.user._id);

        // Update the user document to unset the refreshToken field
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: { refreshToken: 1 } // This removes the field from the document
            },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        };

        // Clear the accessToken and refreshToken cookies
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.error("Error during logout:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }
        return res.status(500).json(new ApiResponse(500, null, "An error occurred during logout"));
    }
});

export 
    { 
        registerUser,
        loginUser,
        logoutUser

    };