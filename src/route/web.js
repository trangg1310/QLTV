import express from "express";
import homeController, { getHomepage } from "../controller/homeController";
import userController from "../controller/userController";

let router = express.Router();

const initWebRoute = (app) => {
    router.get('/', userController.getHomepage);
    router.get('/login', userController.getLogin);
    router.post('/login', userController.postLogin);

    router.get('/logout', userController.getLogout);

    router.get('/register', userController.getRegister);
    router.post('/register', userController.postRegister)

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