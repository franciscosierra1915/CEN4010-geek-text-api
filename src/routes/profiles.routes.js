const express = require('express');
const router = express.Router();




const profilesCtrl = require('../controllers/profiles.controller');
router.post('/', profilesCtrl.createUser);
router.get('/', profilesCtrl.getAllUsers);




// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────    



module.exports = router;