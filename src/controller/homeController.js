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

let createNewUser = async (req, res) => {
    let { firstName, lastName, email, address } = req.body;
    await pool.execute(`insert into user(firstName, lastName, email, address) values (?,?,?,?)`, [firstName, lastName, email, address]);
    return res.redirect('/');
}

module.exports = {
    getHomepage,
    getDetailPage,
    createNewUser
}