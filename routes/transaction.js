const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');


router.get('/transaction',function(req,res){
    res.render('transaction')
});
router.post('/transaction',function(req,res){
    var testID =uuidV4()
    console.log(testID)
    res.render('transaction')
})


module.exports = router;