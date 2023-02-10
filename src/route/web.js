import express from "express";
import homeController, { getHomepage } from "../controller/homeController";

let router = express.Router();

const initWebRoute = (app) => {
    router.get('/', homeController.getHomepage);

    router.get('/details/user/:userId', homeController.getDetailPage);

    router.post('/create-new-user', homeController.createNewUser);

    router.get('/about', (req, res) => {
        res.send(`I'm zau!`);
    })

    return app.use('/', router)
}

export default initWebRoute;