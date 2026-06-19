const express = require('express');
const router = express.Router();




const profilesCtrl = require('../controllers/profiles.controller');
router.post('/', profilesCtrl.createUser);
router.get('/', profilesCtrl.getAllUsers);
router.get('/:userName', profilesCtrl.getUserByUsername);




// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────    



module.exports = router;