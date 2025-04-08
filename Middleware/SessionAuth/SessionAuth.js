
const checkSession = (req, res, next) =>{
    if(!req.session.isAuthenticated){
        return res.status(401).json({
            message: "Invalid User"
        })
    }
    next()
}
module.exports = checkSession