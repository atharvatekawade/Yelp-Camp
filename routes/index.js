var express=require('express');
var router=express.Router();
var passport=require('passport');
var flash = require("connect-flash");
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
        let url;
        url=req.path+'/login?e='+encodeURIComponent('Log in required')
        //url=req.path+'/login';
        //req.flash('error','Please Login First!')
        res.redirect(url);
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

router.get('/secrets',CheckLog,function(req,res){
    res.render('campgrounds/secrets.ejs',{user:req.user})
})





router.get('/:provider/login',NotCheckLog,function(req,res){
    let url='/'+req.params.provider+'/login'
    res.render('campgrounds/login1.ejs',{user:req.user,r:req.params.provider,url:req.flash('url'),messages:req.flash('error'),red:req.flash('red')})
})
router.get('/:id/:provider/login',NotCheckLog,function(req,res){
    res.render('campgrounds/login.ejs',{user:req.user})
})

router.get('/register',NotCheckLog,(req,res) => {
    res.render('campgrounds/register.ejs',{user:req.user,red:req.flash('red')})
})

router.post('/register',NotCheckLog,(req,res) => {
    let username=req.body.username;
    let s=`SELECT * FROM users WHERE username = "${username}"`;
    let q=db.query(s,(err,result) => {
        if (result.length>0){
            req.flash('red','Username already taken');
            res.redirect('/register')
        }
        else{
            let user={
                username:req.body.username,
                password:req.body.password
            };
            let s = 'INSERT INTO users SET ?';
            let q = db.query(s, user, (err, result) => {
                if(err) throw err;
                console.log(result);
                req.flash('green','Successfully registered')
                res.redirect('/campgrounds');
            });
        }
    })
})










/*router.post('/register',NotCheckLog,(req,res) => {
    let user={
        username:req.body.username,
        password:req.body.password
    };
    console.log(req.body.username)
    let s=`SELECT * FROM users WHERE username = "${req.body.username}"`;
    let q=db.query(s,(err,result) => {
        console.log(result.length)
        if(result.lenght==1){
            console.log(result.length)
            //res.redirect('/register')
            console.log('True')
        }
        /*else{
            console.log('Why are you coming here')
            let s = 'INSERT INTO users SET ?';
            let q = db.query(s, user, (err, result) => {
                if(err) throw err;
                console.log(result);
                res.redirect('/login');
            });

        }*/
        /*else{
            console.log(result.length)
            console.log('Not True')
        }

    })
    
})*/

router.get('/login',NotCheckLog,function(req,res){
    //res.render('campgrounds/login.ejs',{user:req.user,msg:req.flash('error')})
    res.render('campgrounds/login.ejs',{user:req.user,messages:req.flash('error'),red:req.flash('red')})
})

router.post('/login',NotCheckLog,
    //console.log('Reached post route for login');
    passport.authenticate('local',{
    //req.flash('red','Please login first'),
    successFlash:true,
    successRedirect:'/campgrounds',
    failureFlash:true,
    failureRedirect:'/login'
    
})

)


function getProviderandRedirect(req, res, next){
    var provider = req.params.provider
    if(provider==='secrets'){
        passport.authenticate('local', {
        successRedirect: '/'+provider,
        failureRedirect: '/login',
        failureFlash:true
    })(req, res, next)
    }
    else{
        if(provider==='new'){
            passport.authenticate('local', {
                successRedirect: '/campgrounds/'+provider,
                failureRedirect: '/login',
                failureFlash:true
            })(req, res, next)
        }
        else if (Number(provider)>0){
            passport.authenticate('local', {
                successRedirect: '/campgrounds/'+provider+'/comments/new',
                failureRedirect: '/login',
                failureFlash:true
            })(req, res, next)
        }
        else{
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/login',
                failureFlash:true
            })(req, res, next)
        }
    }
  }


router.post('/:provider/login',NotCheckLog,getProviderandRedirect)









router.delete('/logout',CheckLog,function(req,res){
    req.logOut()
    req.flash('green','Logged out')
    res.redirect('/campgrounds')
})

module.exports=router