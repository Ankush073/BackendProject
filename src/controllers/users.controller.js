import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/clodinary.js";
import {User} from "../models/users.models.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

export { registerUser };