import pool from "../config/connectDB";
import moment from "moment/moment";

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

let getAdminRent = async(req, res) => {
    if (req.session.dalogin!==true){
        res.redirect('/login');
    }else{
        if(req.session.email=== process.env.EMAIL_ADMIN) {
            let [history,fields] = await pool.execute(`SELECT book.tenSach,book.idSach,book.viTri, book.tenTG, book.NXB, book.namXB, book.theLoai,
              chitietphieumuon.trangThai, phieumuon.ngayMuon, phieumuon.ngayHenTra, phieumuon.tienCoc, chitietphieumuon.idPhieuMuonChiTiet,
              phieumuon.idUser, user.name, chitietphieumuon.ngayTra 
              FROM book, chitietphieumuon, phieumuon, user 
              WHERE book.idSach = chitietphieumuon.idSach 
              AND chitietphieumuon.idPhieuMuon = phieumuon.idPhieuMuon 
              AND phieumuon.idUser = user.idUser`);
              console.log(history)
            res.render('adminRent.ejs', {history:history});
        }
    }
}

let postAdminRent = async(req, res) => {
    if(req.body.action=="update"){
        console.log(req.body);
        if(req.body.ngayTra==''&& req.body.trangThai=="Đã trả") {
            let curTimeString = moment(new Date().toLocaleString(), "MM/DD/YYYY HH:mm:ss a").format("YYYY-MM-DD");
            await pool.execute(`update chitietphieumuon set ngayTra=?, trangThai=? where idPhieuMuonChiTiet = ?`, [curTimeString, req.body.trangThai, req.body.idPhieuMuonChiTiet]);
        } else if(req.body.ngayTra!=='' && req.body.trangThai=="Đã trả"){
            await pool.execute(`update chitietphieumuon set ngayTra=?, trangThai=? where idPhieuMuonChiTiet = ?`, [req.body.ngayTra, req.body.trangThai, req.body.idPhieuMuonChiTiet]);
        } else if(req.body.trangThai=="Chưa trả") {
            await pool.execute(`update chitietphieumuon set ngayTra=?, trangThai=? where idPhieuMuonChiTiet = ?`, ["0000-00-00",req.body.trangThai, req.body.idPhieuMuonChiTiet]);
        }
    } else if(req.body.action=="delete") {
        await pool.execute(`delete from chitietphieumuon where idPhieuMuonChiTiet = ?`, [req.body.idPhieuMuonChiTiet]);
    }
    res.redirect("/admin/rent"); 
}

let searchBook = async(req, res) => {
    console.log(req.query);
    let sql = "SELECT * from book where tenSach LIKE '%"+req.query.book+"%' OR tenSach LIKE '"+req.query.book+"%' OR tenSach LIKE '%"+req.query.book+"' OR theLoai LIKE '%"+req.query.book+"%' OR theLoai LIKE '"+req.query.book+"%' OR theLoai LIKE '%"+req.query.book+"' OR tenTG LIKE '%"+req.query.book+"%' OR tenTG LIKE '"+req.query.book+"%' OR tenTG LIKE '%"+req.query.book+"'";
    console.log(sql);
    let [book, fields] = await pool.execute(sql);
    return res.render('adminBook.ejs', {book: book})
}

let searchUser = async(req, res) => {
    console.log(req.query);
    let sql = "SELECT * from user where email LIKE '%"+req.query.user+"%' OR email LIKE '"+req.query.user+"%' OR email LIKE '%"+req.query.user+"' AND email != '"+process.env.EMAIL_ADMIN +"'";
    console.log(sql);
    let [user, fields] = await pool.execute(sql);
    return res.render('adminUser.ejs', {user: user})
}

let getAdminTK = async(req, res) => {
    if (req.session.dalogin!==true){
        res.redirect('/login');
    }else{
        if(req.session.email=== process.env.EMAIL_ADMIN) {
            const dthutheongay = await pool.execute('select phieumuon.ngayMuon as ngayMuon, sum(phieuMuon.tienCoc) as tienCoc from phieumuon group by phieumuon.ngayMuon order by phieuMuon.ngayMuon asc');
            console.log(dthutheongay[0])
            res.render('adminTK.ejs', {doanhthu:dthutheongay[0]});
        }
    }
}
module.exports = {
    getAdminPage,
    getAdminBook,
    createBook,
    postBook,
    getAdminUser,
    postAdminUser, 
    logOut,
    getAdminRent,
    postAdminRent,
    searchBook,
    searchUser,
    getAdminTK
}