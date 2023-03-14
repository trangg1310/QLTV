import express from "express";
import userController from "../controller/userController";
import adminController from "../controller/adminController";

let router = express.Router();

const initWebRoute = (app) => {
    router.get('/', userController.getHomepage);
    router.get('/login', userController.getLogin);
    router.post('/login', userController.postLogin);

    router.get('/register', userController.getRegister);
    router.post('/register', userController.postRegister);

    router.get('/user', userController.getUserPage);
    router.get('/user/logout', userController.getLogout);
    router.post('/user/infor', userController.postInfor);
    router.post('/user/infor/password', userController.postPassword);

    router.get('/user/history', userController.getHistory);
    router.get('/user/book', userController.getMuonSach);
    router.get('/user/rent', userController.getPhieuMuon);
    router.post('/user/rent', userController.createGioHang);
    router.post('/user/phieumuon', userController.delGioHang);
    router.post('/user/createphieumuon', userController.createPhieuMuon);
    router.get('/user/book/search', userController.searchBook)

    router.get('/admin', adminController.getAdminPage);
    router.get('/admin/book', adminController.getAdminBook);
    router.post('/admin/themsach', adminController.createBook);
    router.post('/admin/book', adminController.postBook);
    router.get('/admin/user', adminController.getAdminUser);
    router.get('/admin/logout', adminController.logOut);

    // router.get('/details/user/:userId', homeController.getDetailPage);

    //router.post('/create-new-user', homeController.createNewUser);

    // router.post('/delete-user', homeController.deleteUser);

    // router.get('/edit-user/:userId', homeController.editUser);

    // router.post('/update-user', homeController.updateUser);

    // router.get('/about', (req, res) => {
    //     res.send(`I'm zau!`);
    // })


    return app.use('/', router)
}

export default initWebRoute;