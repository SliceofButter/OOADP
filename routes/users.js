const express = require('express');
const router = express.Router();

// Bring in user model

let User = require('../models/user');

// Register Form
router.get('/register',function(req,res){
    res.render('register')
});

module.exports = router;