const sendToken = (user, statusCode, res, message) => {
    const token = user.getJWTTOKEN();
    const options = {
        httpOnly: true,
        expires: new Date(
            Date.now() + 1 * 24*60*60*1000
        )
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user,
        token
    })
}


module.exports = {sendToken}