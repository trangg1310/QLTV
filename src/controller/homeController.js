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

let deleteUser = async (req, res) => {
    let userId = req.body.userId;
    await pool.execute(`delete from user where id = ?`, [userId]);
    return res.redirect('/');
}

let editUser = async (req, res) => {
    let userId = req.params.userId;
    let [user, fields] = await pool.execute(`select * from user where id = ?`, [userId]);
    return res.render('updateuser.ejs', { dataUser: user[0] });
}

let updateUser = async (req, res) => {
    let { firstName, lastName, email, address, id } = req.body;
    await pool.execute(`update user set firstName = ?, lastName = ?, email = ?, address = ? where id = ?`, [firstName, lastName, email, address, id]);
    return res.redirect('/');
}

module.exports = {
    getHomepage,
    getDetailPage,
    createNewUser,
    deleteUser,
    editUser,
    updateUser
}