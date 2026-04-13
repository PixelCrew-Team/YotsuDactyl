const db = require('../database');

module.exports = async function(req, res, next) {
    if (req.session && req.session.userId) {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
        if (result.rows.length > 0) {
            res.locals.user = result.rows[0];
            return next();
        }
    }
    res.redirect('/');
};