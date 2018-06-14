const express = require('express');
const router = express.Router();

//Product page
router.get('/product',function(req,res){
    res.render('product')
    console.log(user.id);
  });  

  
module.exports = router;