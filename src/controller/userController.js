import pool from "../config/connectDB";
import bcrypt from "bcrypt";
import moment from "moment/moment";


const user = {
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    cmnd: '',
    gender: '',
    password: '',
    password2: ''
}

let errors = [];


let getHomepage = async (req, res) => {
    if (req.session.dalogin !== true) {
         return res.redirect("/login");
    } else {
        if (req.session.email == process.env.EMAIL_ADMIN) {
            // console.log("view admin page");
            res.redirect("/admin");
        } else {
            return res.redirect('/user');
        }
        
    }
}

    

let getLogin = async (req, res) => {
    return res.render('login.ejs')
}

let postLogin = async(req, res) => {
    let {email, password} = req.body;
    //console.log(email, password);
    let results = await pool.query (`select * from user where email = ?`, [email])

    if(results[0].length <=0) {
        req.flash('error', "Tài khoản chưa được đăng ký");
        return res.redirect('/login');
    }
    let user = results[0];
    let passFromDb = user[0].password;
    //console.log(passFromDb);
    console.log()
    try {
        let kq = await bcrypt.compare(password, passFromDb);
        if(kq) {
            console.log("đăng nhập thành công");
            var sess = req.session;
            sess.dalogin= true;
            sess.email=user[0].email;
            sess.giohang = [];
            console.log(sess.email);
            if(sess.email == process.env.EMAIL_ADMIN) {
                return res.redirect('/admin');
            }
            return res.redirect('/user');
        } else {
            req.flash('error', "mật khẩu không đúng");
            return res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
    
}



let getLogout = async (req, res) => {
    req.session.destroy();
    //req.flash('success_msg', "Bạn vừa đăng xuất.");
    return res.redirect('/login');
}

let getRegister = async (req, res) => {
    return res.render('register.ejs', { user: user })
}

let postRegister = async (req, res) => {
    let { name, email, address, phoneNumber, cmnd, gender, password, password2 } = req.body;
    let errors = [];

    var phone_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if(phoneNumber.length != 10 || phone_regex.test(phoneNumber) == false){
        // user.phone = ''
        req.body.phoneNumber = ''
        errors.push({message: "Số điện thoại không hợp lệ."});
    }

    var cmnd_regex =   /^[0-9_-]{9,12}$/;
    if((cmnd.length != 9 && cmnd.length != 12) || cmnd_regex.test(cmnd) == false){
        // user.CMND = ''
        req.body.cmnd = ''
        errors.push({message: "Số CMND/CCCD phải gồm 9 hoặc 12 số."});
    }
    if(password.length < 6){
        errors.push({message: "Mật khẩu cần có ít nhất 6 ký tự."});
    }

    if(password !== password2){
        errors.push({message: "Mật khẩu xác nhận không khớp."});
    }

    if(errors.length > 0){
        console.log(errors);
        return res.render("register.ejs", {errors: errors, user: req.body});
    }else{
        // form validation has pass

        let hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);

        let resultEmail = await pool.execute(`select * from user where email = ?`, [email]);
        if(resultEmail[0].length > 0) {
            req.body.email = '';
            errors.push({message: "Email này đã đăng ký với tài khoản khác."});
            if(errors.length > 0) res.render('register.ejs', {errors: errors, user: req.body});
        } else {
            let resultsCmnd = await pool.execute(`select * from user where cmnd = ?`, [cmnd]);
            if(resultsCmnd[0].length > 0) {
                req.body.cmnd = '';
                errors.push({message: "Số CMND/CCCD đã được đăng ký với tài khoản khác."})
            }
            if(errors.length > 0) res.render('register.ejs', {errors: errors, user: req.body});
            else {
                await pool.execute(`INSERT INTO user (name, email, address, phoneNumber, cmnd, gender, password)
                VALUES (?,?,?,?,?,?,?)`,
                [name, email, address, phoneNumber, cmnd, gender, hashedPassword]);
                req.flash('success_msg', "Đăng ký thành công. Vui lòng đăng nhập.");
                return res.redirect('login');
            }
        }
    }
}

let getUserPage = async(req, res) => {
    if(req.session.dalogin==true && req.session.email !== process.env.EMAIL_ADMIN) {
        let [user, fields] = await pool.query(`select * from user where email = ?`, [req.session.email]);
        return res.render('user.ejs', {user: user[0], errors: errors});
    } else {
        return res.redirect('/login');
    }
}


let postInfor = async(req, res) => {
    let {email, name, phoneNumber, address, cmnd, gender} = req.body;
    errors = [];
    var phone_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if(phoneNumber.length != 10 || phone_regex.test(phoneNumber) == false){
        errors.push({message: "Số điện thoại không hợp lệ"});
    }
    var cmnd_regex =   /^[0-9_-]{9,12}$/;
    if((cmnd.length != 9 && cmnd.length != 12) || cmnd_regex.test(cmnd) == false){
        errors.push({message: "Số CMND/CCCD phải gồm 9 hoặc 12 số"});
    }
    gender = gender.trim();
    if(gender != "Nam" && gender != "Nữ"){
        errors.push({message: "Giới tính phải là Nam hoặc Nữ"});
    }
    if(errors.length>0) {
        res.redirect('/user');
    } else {
        await pool.execute(`update user set name=?, phoneNumber=?, address=?, cmnd=?, gender=? where email=?`, [name, phoneNumber, address, cmnd, gender, email]);
        req.flash('success_msg', "Thay đổi thông tin thành công");
        res.redirect("/user");
    }
}

let postPassword = async(req, res) => {
    errors = [];
    let {email, password, password1, password2} = req.body;
    if(password1 !== password2){
        errors.push({message: 'Mật khẩu xác nhận không khớp.'})
    }
    if(password.length < 6 || password1.length < 6 || password2.length < 6){
        errors.push({message: "Mật khẩu cần có ít nhất 6 ký tự."});
    }
    if(errors.length > 0){
        res.redirect('/user');
    } else {
        let results = await pool.query (`select * from user where email = ?`, [email]);
        let user = results[0];
        let curPass = user[0].password;
        let check = bcrypt.compareSync(password, curPass);
        if(!check){
            errors.push({message: 'Mật khẩu cũ không đúng.'});
            res.redirect('/infor');
        } else {
            let hashedPassword = await bcrypt.hash(password1, 10);
            await pool.execute(`update user set password = ? where email=?`, [hashedPassword, email]);
            req.flash('success_msg', "Thay đổi mật khẩu thành công.");
            res.redirect('/user');
        }
    }

}

let getHistory = async(req, res) => {
    if(req.session.dalogin==true && req.session.email !== process.env.EMAIL_ADMIN) {
        let [idUser, fields1] = await pool.execute(`select idUser from user where email=?`, [req.session.email]);
        let [history, fields] = await pool.execute(`SELECT book.tenSach,book.idSach,book.viTri, book.tenTG, book.NXB, book.namXB, book.theLoai, 
        chitietphieumuon.trangThai, phieumuon.ngayMuon, phieumuon.ngayHenTra, phieumuon.tienCoc, chitietphieumuon.idPhieuMuonChiTiet, phieumuon.soLuong
        FROM book, chitietphieumuon, phieumuon
        WHERE book.idSach = chitietphieumuon.idSach
        AND chitietphieumuon.idPhieuMuon = phieumuon.idPhieuMuon
        AND phieumuon.idUser = ?`, [idUser[0].idUser]);
        return res.render('history.ejs', {history: history});
    } else {
        return res.redirect('/login');
    }
    
}

let getMuonSach = async(req, res) => {
    if(req.session.dalogin==true && req.session.email !== process.env.EMAIL_ADMIN) {
        let [book, fields] = await pool.query(`select * from book`);
        return res.render('rent.ejs', {book: book});
    } else {
        return res.redirect('/login');
    }
}

let getPhieuMuon = async(req, res) => {
    if(req.session.dalogin==true && req.session.email !== process.env.EMAIL_ADMIN) {
        return res.render('phieumuon.ejs', {book: req.session.giohang, errors: errors});
    } else {
        return res.redirect('/login');
    }
}

let createGioHang = async(req, res) => {
    let x = req.session.giohang.length;
    for(let index = 0; index<x; index++) {
        if(req.session.giohang[index].idSach===req.body.idSach) {
            req.flash('error', "Sách đã có trong phiếu mượn.");
            return res.redirect('/user/book');            
        }
    }
    if(req.body.trangThai==='Không thể mượn') {
        req.flash('error', "Sách đang trong tình trạng không thể mượn.");
        return res.redirect('/user/book');    
    }
    req.session.giohang[x] = req.body;
    req.flash('success_msg', "Thêm sách vào phiếu mượn thành công.")
    return res.redirect('/user/book');
}

let delGioHang = async(req, res) => {
    errors = [];
    let removeIndex = req.session.giohang.findIndex( item => item.idSach === req.body.idSach);
    req.session.giohang.splice(removeIndex, 1);
    console.log(req.session.giohang);
    res.redirect('/user/rent')
}

let createPhieuMuon = async(req, res) => {
    console.log(req.body);
    let soLuong = 0;
    let tienCoc = 0;
    errors = [];
    for(let index = 0; index< req.session.giohang.length; index++) {
        soLuong++;
        tienCoc+=5000;
    }
    let ngayMuon = req.body.ngayMuon;
    let ngayHenTra = req.body.ngayHenTra;
    let tmpNgayMuon = new Date(ngayMuon);
    let tmpNgayHenTra = new Date(ngayHenTra);
    let tmpcurTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let curTime = new Date(tmpcurTime);
    console.log(curTime);
    if(soLuong==0) {
        //req.flash('error', "Không có quyển sách nào trong giỏ hàng!");
        errors.push({message: "Không có quyển sách nào trong giỏ hàng!"})
    } else
    if(req.body.ngayMuon=='' || req.body.ngayHenTra=='') {
        //req.flash('error', "Bạn chưa điền thời gian mượn/trả!");
        errors.push({message: "Bạn chưa điền thời gian mượn/trả!"})
    } else
    if(tmpNgayMuon > tmpNgayHenTra) {
        //req.flash("Ngày mượn phải trước ngày hẹn trả!");
        errors.push({message: "Ngày mượn phải trước ngày hẹn trả!"})
    } else 
    if(curTime> tmpNgayMuon) {
        errors.push({message: "Ngày mượn không thể trước ngày hôm nay!"});
    } else
    if(req.body.trangThai==="available") {
        errors.push({message: "Có quyển sách không thể mượn trong phiếu mượn!"});
    }
    if(errors.length>0) {
        res.redirect('/user/rent');
    } else {
        let [idUser, fields] = await pool.execute(`select idUser from user where email=?`, [req.session.email]);
        console.log(idUser);
        //let curTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let curTimeString = moment(new Date().toLocaleString(), "MM/DD/YYYY HH:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
        await pool.execute(`insert into phieumuon (idUser, soLuong, ngayMuon, ngayHenTra, tienCoc, timeCreate) values (?,?,?,?,?,?)`,
        [idUser[0].idUser,soLuong,ngayMuon,ngayHenTra,tienCoc, curTimeString]);
        let [idPhieuMuon, tmp] = await pool.execute(`select idPhieuMuon from phieumuon where idUser=? and timeCreate=?`,
        [idUser[0].idUser, curTimeString]);
        for(let index = 0; index<req.session.giohang.length; index++) {
            await pool.execute(`insert into chitietphieumuon (idPhieuMuon, idSach, trangThai) values (?,?,?)`, [idPhieuMuon[0].idPhieuMuon, req.session.giohang[index].idSach, "Chưa trả"]);
            await pool.execute(`update book set trangThai =? where idSach=?`, ["available", req.session.giohang[index].idSach]);
        }
        req.session.giohang=[];
        req.flash('success_msg',"Đặt đơn mượn sách thành công!");
        res.redirect('/user/rent');
    }
}
let searchBook = async(req, res) => {
    console.log(req.query);
    let sql = "SELECT * from book where tenSach LIKE '%"+req.query.book+"%' OR tenSach LIKE '"+req.query.book+"%' OR tenSach LIKE '%"+req.query.book+"' OR theLoai LIKE '%"+req.query.book+"%' OR theLoai LIKE '"+req.query.book+"%' OR theLoai LIKE '%"+req.query.book+"' OR tenTG LIKE '%"+req.query.book+"%' OR tenTG LIKE '"+req.query.book+"%' OR tenTG LIKE '%"+req.query.book+"'";
    console.log(sql);
    let [book, fields] = await pool.execute(sql);
    return res.render('rent.ejs', {book: book})
}
module.exports = {
    getLogin,
    getHomepage,
    postLogin,
    getLogout,
    getRegister,
    postRegister,
    getUserPage,
    postInfor,
    postPassword,
    getHistory,
    getMuonSach,
    getPhieuMuon,
    createGioHang,
    delGioHang,
    createPhieuMuon,
    searchBook
}