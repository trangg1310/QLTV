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
module.exports = {
    getAdminPage,
    getAdminBook,
    createBook,
    postBook
}