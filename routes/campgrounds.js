var express=require('express');
var router=express.Router();
var passport=require('passport');
//const db = require('../app.js');
var mysql = require('mysql');
const imp=require('../../db.js');

const db = mysql.createConnection({
    host     : imp.host,
    user     : imp.user,
    password : imp.password,
    database : imp.database
});
function CheckLog(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    else{
        
        
        //res.render('campgrounds/Landing.ejs',{user:req.user,msg:'You need to login first'})
        //res.redirect('/',{msg:'You need to login first'})
        //res.redirect(req.path+'/login?e=' + encodeURIComponent('Log in required'));
        req.flash('red','Please login first');
        req.flash('url',req.path+'/login')
        res.redirect(req.path+'/login');
        
    }
}




function NotCheckLog(req,res,next){
    if(req.isAuthenticated()){
        
        res.redirect('/?e=' + encodeURIComponent('Already logged in'));
    }
    else{
        return next()
    }
}


/*router.get('/', (req, res) => {
    let sql = 'SELECT * FROM campgrounds';
    let query = db.query(sql, (err, results) => {
        if(err){
            res.send(err);
        }
        res.render('campgrounds/Index.js',{campgrounds:results,user:req.user,green:req.flash('success'),msg:req.flash('green')});
    });
});*/
router.get('/',(req,res) => {
    let sql='SELECT * FROM campgrounds';
    let query=db.query(sql,(err,results) => {
        if(err) throw err;
        res.render('campgrounds/Index.ejs',{campgrounds:results,user:req.user,green:req.flash('success'),msg:req.flash('green')});
    })
})


router.get('/new',CheckLog,function(req,res){
    res.render('campgrounds/New.ejs',{user:req.user})
})

router.get('/:id/edit',CheckLog,function(req,res){
    let sql = `SELECT * FROM campgrounds WHERE id = ${req.params.id}`;
    let query = db.query(sql, function(err, result){
        if(err) throw err;
        if(req.user.username===result[0].author){
            res.render('campgrounds/edit.ejs',{ground:result[0],user:req.user})
        }
        else{
            req.flash('red','You are not authorized')
            res.redirect('/campgrounds/'+req.params.id)
        }
    })

})


router.put('/:id',CheckLog,function(req,res){
    let no=req.params.id;
    let title=req.body.title
    let img=req.body.image
    let desc=req.body.desc
    let price=req.body.price
    
    //let sql = `UPDATE campgrounds SET name="${title}", image="${img}", description="${desc}" WHERE id="${no}"`;
    let sql=`SELECT * FROM campgrounds WHERE id = "${no}"`
    let query = db.query(sql, function(err, result){
        if(err) throw err;
        if(req.user.username===result[0].author){
            let s=`UPDATE campgrounds SET name="${title}", image="${img}", description="${desc}", price="${price}" WHERE id="${no}"`
            let q=db.query(s,function(err,something){
                res.redirect('/campgrounds/'+no)
            })
        }
        else{
            res.redirect('/campgrounds/'+no)
        }
        
    })
    //console.log(req.params.id);
    //res.redirect('/campgrounds');

})

router.delete('/:id',CheckLog,(req,res) => {
    let no=req.params.id
    //let sql = `DELETE FROM campgrounds WHERE id="${no}"`;
    let sql = `SELECT * FROM campgrounds WHERE id = "${no}"`;
    let query = db.query(sql, function(err, result){
        if(err) throw err;
        if(req.user.username===result[0].author){
            let sq = `DELETE FROM campgrounds WHERE id="${no}"`;
            let query = db.query(sq, function(err){
                if(err) throw err;
                res.redirect('/campgrounds')
            })
            
        }
        else{
            res.redirect('/campgrounds/'+no)
        }
    })

})

router.post('',CheckLog,function(req,res){
    let title=req.body.title;
    let image=req.body.image;
    let description=req.body.desc
    let price=req.body.price
    let ground = {name:title,image:image,description:description,author:req.user.username,price:price};
    let sql = 'INSERT INTO campgrounds SET ?';
    let query = db.query(sql, ground, (err, result) => {
        if(err) throw err;
        
    });
    res.redirect('/campgrounds');


})


router.get('/:id', (req, res) => {
    
    let sql = `SELECT * FROM campgrounds WHERE id = ${req.params.id}`;
    let query = db.query(sql, function(err, result_1){
        if(err) throw err;
        let statement=`SELECT * FROM showcomments WHERE CampID = ${req.params.id}`;
        let second=db.query(statement,function(error,result_2){
            if(error) throw error;
            res.render('campgrounds/Show.ejs',{result_1:result_1[0],result_2:result_2,user:req.user,red:req.flash('red')});
        })
        
    });
    
});

module.exports=router