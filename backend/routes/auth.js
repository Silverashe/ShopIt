const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');


const { allUsers, 
    registerUser, 
    loginUser, logout, 
    forgotPassword,
    resetPassword,
    getUserProfile, 
    updatePassword, 
    updateProfile, 
    getUser,
    updateUserInfo,
    deleteUser} = require('../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').get(logout);

router.route('/me').get( isAuthenticatedUser, getUserProfile);

router.route('/password/me').put(isAuthenticatedUser, updatePassword);

router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);

router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles("admin"), getUser);

router.route('/admin/update/user/:id').put(isAuthenticatedUser, authorizeRoles("admin"), updateUserInfo);

router.route('/admin/delete/user/:id').delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;