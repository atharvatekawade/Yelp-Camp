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
        let parts=req.path.split('/');
        req.flash('red','Login required')
        res.redirect('/login');   
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


router.get('/campgrounds/:id/comments/new',CheckLog,function(req,res){
    let sql = `SELECT * FROM campgrounds WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;   
        res.render('comments/New.ejs',{id:req.params.id.toString(),result:result[0],user:req.user});
    });
    

})


router.get('/campgrounds/:id/comments/:c_id/edit',CheckLog,function(req,res){
    let no=req.params.c_id
    let sql = `SELECT * FROM showcomments WHERE id = "${no}"`;
    let query=db.query(sql,(err,result) => {
        if(err) throw err;
        if(req.user.username===result[0].author){
            res.render('comments/EditComment.ejs',{user:req.user,comment:result[0]})
        }
        else{
            req.flash('red','You are not authorized')
            res.redirect('/campgrounds/'+result[0].CampID)
        }
    })
});

router.put('/campgrounds/:id/comments/:c_id',CheckLog,function(req,res){
    let no=req.params.c_id
    let n=req.params.id
    let text=req.body.text
    let sql=`SELECT * FROM showcomments WHERE id = "${no}"`
    let query = db.query(sql, function(err, result){
        if(err) throw err;
        if(req.user.username===result[0].author){
            let s=`UPDATE showcomments SET text="${text}" WHERE id="${no}"`
            let q=db.query(s,function(err,something){
                res.redirect('/campgrounds/'+n)
            })
        }
        else{
            res.redirect('/campgrounds/'+n)
        }
        
    })
});

router.delete('/campgrounds/:id/comments/:c_id',CheckLog,(req,res) => {
    let no=req.params.c_id
    let n=req.params.id
    //let sql = `DELETE FROM campgrounds WHERE id="${no}"`;
    let sql = `SELECT * FROM showcomments WHERE id = "${no}"`;
    let query = db.query(sql, function(err, result){
        if(err) throw err;
        if(req.user.username===result[0].author){
            let sq = `DELETE FROM showcomments WHERE id="${no}"`;
            let query = db.query(sq, function(err){
                if(err) throw err;
                res.redirect('/campgrounds/'+n)
            })
            
        }
        else{
            res.redirect('/campgrounds/'+n)
        }
    })

})


    









router.post('/campgrounds/:id/comments',CheckLog,(req, res) => {
    
    let comment = {text:req.body.text, author:req.user.username, CampID:req.params.id};
    let sql = 'INSERT INTO showcomments SET ?';
    let query = db.query(sql, comment, (err, result) => {
        if(err) throw err;
        let url='/campgrounds/'+req.params.id.toString();
        res.redirect(url);
    });
});

module.exports=router