exports.isLoggedIn = (req, res, next) => {
    // console.log(req.session)
    // console.log(req.user.dataValues)
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({
            msg: "로그인이 필요",
        });
    }
}

exports.isNotLoggedIn = (req, res, next) => {
    // console.log(req.session)
    // console.log(req.user.dataValues)
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(200).json({
            msg: "이미 로그인 중",
        });
    }
}