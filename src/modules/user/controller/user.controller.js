
import catchAsync from "../../../utils/catchAsync.js";
import SendResponse from "../../../utils/SendResponse.js";

import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
export const register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return next(res.status(400).json(new SendResponse(400, "name,email,password is required", null)))
    }
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
        return next(res.status(400).json(new SendResponse(400, "email already exists", null)))
    }
    const user = await User.create({ name, email, password })
    return res.status(201).json(new SendResponse(201, "user created successfully", user))

})


export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(res.status(400).json(new SendResponse(400, "email,password is required", null)))
    }
    const user = await User.findOne({
        where: { email },
        attributes: { include: ["password"] },
    })
    if (!user) {
        return next(res.status(400).json(new SendResponse(400, "user not found", null)))
    }
    const validate = await user.isValidPassword(password)
    if (!validate) {
        return next(res.status(400).json(new SendResponse(400, "password is incorrect", null)))
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7 days" });
    return res.status(200).json(new SendResponse(200, "User Login Successfully", { user, token }))
})


export const getUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(res.status(404).json(new SendResponse(404, "user not found", null)))
    }
    return res.status(200).json(new SendResponse(200, "User found successfully.", user))
})

//google auth
export const googleAuth = catchAsync(async (req, res, next) => {
    const { name, email, image, googleId, accessToken } = req.body;
    console.log("🚀 ~ googleAuth ~ req:", req.body)

    // // Validate required fields
    // if (!email || !googleId) {
    //     return res.status(400).json(new SendResponse(400, "Email and Google ID are required", null));
        
    // }

    // // Find or create user
    // let user = await User.findOne({ where: { email } });

    // if (!user) {
    //     // New user - create with Google auth
    //     user = await User.create({
    //         name,
    //         email,
    //         avatar: image,
    //         googleId,
    //         authProvider: 'google',
    //         isVerified: true,
    //         accessToken
    //     });
    // } else if (!user.googleId) {
    //     // Existing user without Google auth - update record
    //     user = await user.update({
    //         googleId,
    //         authProvider: 'google',
    //         isVerified: true,
    //         accessToken
    //     });
    // } else {
    //     // Existing Google user - update access token if changed
    //     if (user.accessToken !== accessToken) {
    //         user = await user.update({ accessToken });
    //     }
    // }

    // // Generate JWT token
    // const token = jwt.sign(
    //     { id: user.id },
    //     process.env.JWT_SECRET,
    //     { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    // );

    // // Prepare user data for response
    // const userData = user.get({ plain: true });
    // delete userData.password;
    // delete userData.accessToken;

    // // Send formatted response
    // return new SendResponse(
    //     res,
    //     200,
    //     'User authenticated successfully',
    //     {
    //         user: userData,
    //         token
    //     }
    // );
});