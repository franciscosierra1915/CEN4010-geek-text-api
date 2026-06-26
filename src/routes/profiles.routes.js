const express = require('express');
const router = express.Router();




const profilesCtrl = require('../controllers/profiles.controller');
router.post('/', profilesCtrl.createUser);
router.get('/', profilesCtrl.getAllUsers);

router.patch('/:username/password', profilesCtrl.updatePassword);
router.patch('/:username/firstName', profilesCtrl.updateFirstName);
router.patch('/:username/lastName', profilesCtrl.updateLastName);
router.patch('/:username/homeAddress', profilesCtrl.updateHomeAddress);
router.patch('/:username/role', profilesCtrl.updateRole);


router.put('/:username', profilesCtrl.updateUser);
router.get('/:username', profilesCtrl.getUserByUsername);

// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────    



module.exports = router;