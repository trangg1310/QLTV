import pool from "../config/connectDB";
import bcrypt from "bcrypt";


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
    return res.render('history.ejs');
}

let getMuonSach = async(req, res) => {
    return res.render('rent.ejs');
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
    getMuonSach
}