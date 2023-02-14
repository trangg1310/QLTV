import pool from "../config/connectDB";
import bcrypt from "bcrypt";
import passport from "passport";


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

let getHomepage = async (req, res) => {
    if (user == null) {
        res.redirect("/login");
    } else {
        res.render('login.ejs', {message: req.flash('message')})
    }
}

let getLogin = async (req, res) => {
    res.render('login.ejs')
}

let postLogin = () => {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })
}

let getLogout = async (req, res) => {
    req.logOut();
    req.flash('success_msg', "Bạn vừa đăng xuất.");
    res.redirect('/login');
}

let getRegister = async (req, res) => {
    res.render('register.ejs', { user: user })
}

let postRegister = async (req, res) => {
    let { name, email, address, phoneNumber, cmnd, gender, password, password2 } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(`INSERT INTO user (name, email, address, phoneNumber, cmnd, gender, password)
    VALUES (?,?,?,?,?,?,?)`,
    [name, email, address, phoneNumber, cmnd, gender, hashedPassword]);
    res.send('them moi user');
    /*let errors = [];

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
        res.render("register.ejs", {errors: errors, user: req.body});
    }else{
        // form validation has pass

        let hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);

        await pool.execute(
            `SELECT * FROM user WHERE email = ?`, [email], (err, results) => {
               
                // console.log(results.rows.length);

                if(results.rows.length > 0){
                    // user.email = ''
                    req.body.email = ''
                    errors.push({message: "Email này đã đăng ký với tài khoản khác."});
                }
                
                    pool.execute(
                        `SELECT * FROM user WHERE cmnd = ?`, [cmnd], (err, results)=>{
                            if(results.rows.length > 0){
                                // user.CMND = ''
                                req.body.cmnd = ''
                                errors.push({message: "Số CMND/CCCD đã được đăng ký với tài khoản khác."})
                            }
                            if(errors.length > 0) res.render('register', {errors: errors, user: req.body})
                            else
                                pool.execute(
                                    `INSERT INTO user (name, email, address, phoneNumber, cmnd, gender, password)
                                    VALUES (?,?,?,?,?,?,?)`,
                                    [name, email, address, phoneNumber, cmnd, gender, hashedPassword],
                                    (err, results) => {
                                        if(err){
                                            throw err;
                                        }
                                        
            
                                        req.flash('success_msg', "Đăng ký thành công. Vui lòng đăng nhập.");
                                        res.redirect('login');
                                    }
                                )
                                
                            
                        }
                    )
            }
        )
    }*/
}

module.exports = {
    getLogin,
    getHomepage,
    postLogin,
    getLogout,
    getRegister,
    postRegister
}