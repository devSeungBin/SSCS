const db = require('../models/index.db');
const { GroupUsers } = db;

exports.isGroupUser = async (req, res, next) => {
    if (await GroupUsers.findOne({ where: { user_id: req.user.id, group_id: req.query.id }, raw: true })) {
        next();
    } else {
        res.status(403).json({
            msg: "해당 그룹이 존재하지 않거나 그룹 참여자가 아님",
        });
    }
}

