import pool from "../config/connectDB";

var message = "";
var error = "";

let getAdminPage = async(req, res) => {
    if (req.session.dalogin!==true){
        res.redirect('/login');
    }else{
        if(req.session.email=== process.env.EMAIL_ADMIN);
        res.render('admin.ejs');
    }
}

let getAdminBook = async(req, res) => {
    if(req.session.dalogin!==true) {
        res.redirect('/login');
    } else {
        let book = await pool.execute(`select * from book`);
        return res.render('adminBook.ejs', {book: book[0]});
    }
}

let createBook = async(req, res) => {
    let {viTri, tenSach, tenTG, namXB, NXB, theLoai,trangThai, giaBia} = req.body;
    await pool.execute(`insert into book(viTri, tenSach,tenTG, namXB, NXB, theLoai,trangThai, giaBia) value (?,?,?,?,?,?,?,?)`, 
    [viTri, tenSach, tenTG, namXB, NXB, theLoai,trangThai, giaBia]);
    return res.redirect('/admin/book');
}

let postBook = async(req, res) => {
    if(req.body.action == 'update') {
        let {idSach, viTri, tenSach, tenTG, NXB, namXB, theLoai,trangThai, giaBia, action} = req.body;
        console.log(req.body);
        await pool.execute('update book set viTri = ?, tenSach = ?, tenTG = ?, namXB = ?, NXB = ?, theLoai = ?, trangThai = ?, giaBia = ? where idSach = ?', 
        [viTri,tenSach,tenTG,namXB,NXB,theLoai,trangThai,giaBia,idSach]);
        return res.redirect('/admin/book');
    } else if(req.body.action =='delete') {
        await pool.execute('delete from book where idSach=?', [req.body.idSach]);
        return res.redirect('/admin/book')
    }
}

let getAdminUser = async(req, res) => {
    if(req.session.dalogin!==true) {
        res.redirect('/login');
    } else {
        let user = await pool.execute(`select * from user where email!=?`,[process.env.EMAIL_ADMIN]);
        return res.render('adminUser.ejs', {user: user[0]});
    }
}

let postAdminUser = async(req, res) => {
    if(req.body.action == 'update') {
        let {idUser, name, email, address, phoneNumber, gender, cmnd} = req.body;
        console.log(req.body);
        await pool.execute('update user set name = ?, address = ?, phoneNumber = ?, gender = ?, cmnd = ? where idUser = ?', 
        [name, email, address, phoneNumber, gender, cmnd, idUser]);
    } else if(req.body.action=='delete') {
        await pool.execute('delete from user where idUser = ?', [req.body.idUser]);
    }
}

let logOut = async(req, res) => {
    req.session.destroy();
    //req.flash('success_msg', "Bạn vừa đăng xuất.");
    return res.redirect('/login');
} 

module.exports = {
    getAdminPage,
    getAdminBook,
    createBook,
    postBook,
    getAdminUser,
    postAdminUser, 
    logOut
}