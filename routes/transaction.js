const express = require('express');
const router = express.Router();
const  uuid = require('uuid');

router.get('/transaction',function(req,res){
    res.render('transaction')
});
router.post('/transaction',function(req,res){
    var testID =uuid.v4();
    console.log(testID)
})


module.exports = router;