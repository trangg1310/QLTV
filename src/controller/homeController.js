import pool from "../config/connectDB";

let getHomepage = async (req, res) => {

    const [rows, fields] = await pool.execute('SELECT * FROM `user`');
    return res.render('index.ejs', { dataUser: rows });
}

let getDetailPage = async (req, res) => {
    //console.log(req.params.userId);
    let userId = req.params.userId;
    let user = await pool.execute(`select * from user where id = ?`, [userId]);
    return res.send(JSON.stringify(user[0]));
}

module.exports = {
    getHomepage,
    getDetailPage
}