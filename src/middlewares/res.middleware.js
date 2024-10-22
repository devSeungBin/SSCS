const keys = require('../config/keys.config');

exports.handleError = (req, res) => {

    const result = req.result;
    const error = req.result.error;

    if (result?.redirect !== undefined) {
        const userHomeURL = `http://${keys.CLIENT_HOST}:${keys.CLIENT_PORT}${keys.CLIENT_USERHOME_ROUTER}`;
        return res.redirect(301, userHomeURL);

    } else if (error?.redirect !== undefined) {
        const loginURL = `http://${keys.CLIENT_HOST}:${keys.CLIENT_PORT}${keys.CLIENT_LOGIN_ROUTER}`;
        return res.redirect(301, loginURL);
    };

    if (error) {
        if (error.statusCode === 303) {
            req.result.error.message = '임시 리다이렉트 메세지';
            // return res.redirect(303, keys.PREFERENCE_URL);
    
        } else if (error.statusCode === 400) {
            req.result.error.message = '해당 요청이 올바르지 않습니다.';
    
        } else if (error.statusCode === 401) {
            req.result.error.message = '로그인이 필요한 기능입니다.';
    
        } else if (error.statusCode === 403) {
            req.result.error.message = '권한이 필요한 기능입니다.';
            
        } else if (error.statusCode === 404) {
            req.result.error.message = '요청된 자원이 서버에 존재하지 않습니다.';
            
        } else if (error.statusCode === 409) {
            req.result.error.message = '요청된 자원이 이미 서버에 존재합니다.';
            
        } else {
            req.result.error.message = '서버에서 오류가 발생했습니다.';
        };

        return res.status(error.statusCode).json({ error });

    } else {
        return res.status(result.statusCode).json({ result });
    };

}
