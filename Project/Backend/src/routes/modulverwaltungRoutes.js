
const express = require('express');
const router = express.Router();

const modulverwaltungController =
    require('../controllers/modulverwaltung.Controller');
const { validateModule } = require('../middlewares/modul.middleware');

router.route('/')
    .get(modulverwaltungController.getModule)
    .post(validateModule, modulverwaltungController.createModule)
    .put(validateModule, modulverwaltungController.updateModule)
    .delete(modulverwaltungController.deleteModule);

module.exports = router;
