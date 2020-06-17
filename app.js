var createError = require('http-errors');
var express = require('express');
var path = require('path');
var request=require('request');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var bcrypt=require('bcrypt');
var flash = require("connect-flash");
var passport=require('passport');
var session=require('express-session');
var method=require('method-override');
const LocalStrategy=require('passport-local').Strategy
const imp=require('../db.js');

const db = mysql.createConnection({
    host     : imp.host,
    user     : imp.user,
    password : imp.password,
    database : imp.database
});
var commentRoutes=require('./routes/comments.js')
var campgroundRoutes=require('./routes/campgrounds.js')
var indexRoutes=require('./routes/index.js')

//const initializePassport=require('./passport-config');







var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(method('_method'))
app.use(commentRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use(indexRoutes);

/*app.use(function(req,res,next){
    res.locals.red=req.flash('red');
    res.locals.green=req.flash('green');
})*/

/*app.use(function (req, res, next) {
    res.locals = {
      red: req.flash('red'),
      green: req.flash('green')
    };
    next();
 });*/










app.set('view engine','ejs');


app.use(express.static(__dirname+'/public'));

const port=process.env.PORT || 3000;
// Connect
db.connect((err) => {
    if(err){
        throw err;
        console.log('Mysql not connected')
    }
    console.log('MySql Connected...');
});


/*initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)*/

/*function getUserByUserName(username){
    let sql = `SELECT * FROM users WHERE username = "${username}"`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;   
        return result[0];
    });
}
function getUserById(id){
    let sql = `SELECT * FROM users WHERE id = ${id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;   
        return result[0];
    });
}*/







function initialize(passport){
    /*const authenticateUser= async (username,password,done) => {
        user=getUserByUserName(username);
        
        if (user==undefined){
            return done(null,false,{ message:'No user with this username' })
        }
        else{

        
            try{
                if(await bcrypt.compare(password,user.password)){
                    //return done(null,user,{message:'Successfully logged in'})
                    return done(null,user)
                }
                else{
                    return done(null,false,{ message:'Password incorrect' })
                }
            }
            catch(e){
                return done(e)
            }
        }
    }*/



    passport.use(new LocalStrategy({ usernameField:'username',passwordField:'password' },async function authenticateUser(username,password,done){

        console.log('hello');
    

        let sql = `SELECT * FROM users WHERE username = "${username}"`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;   
            if (result.length===0){
                return done(null,false,{ message:'No user with this username' })
            }
            else{
                try{
                    if(password===result[0].password){
                        return done(null,result[0],{ message:'Successfully logged in' })
                        //return done(null,result[0])
                    }
                    else{
                        return done(null,false,{ message:'Password incorrect' })
                    }
                }
                catch(e){
                    return done(e)
                }
            }
        });
        










    }))

    passport.serializeUser((user,done) => done(null,user.id))
    passport.deserializeUser((id,done) => {
        /*return done(null,function(id){
            let sql = `SELECT * FROM users WHERE id = ${id}`;
            let query = db.query(sql, (err, result) => {
                if(err) throw err;   
                return result;
            });
        })*/
        let sql = `SELECT * FROM users WHERE id = ${id}`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;   
            return done(null,result[0]);
        });

    })
}










initialize(passport);


































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









/*initialize(
    passport,
    //email => users.find(user => user.email === email),
    //id => users.find(user => user.id === id)
    function getUserByUserName(username){
        let sql = `SELECT * FROM users WHERE username = "${username}"`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;   
            return result[0];
        });
    },
    function getUserById(id){
        let sql = `SELECT * FROM users WHERE id = ${id}`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;   
            return result[0];
        });
    }

)*/

































/*let campgrounds=[
    {name:'Salmon Creek',image:'https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e50744074287dd4934ac7_340.jpg'},
    {name:'Granite Hill',image:'https://pixabay.com/get/57e8d1454b56ae14f1dc84609620367d1c3ed9e04e50744074287dd4934ac7_340.jpg'},
    {name:"Mountain Goat's Creek",image:'https://pixabay.com/get/54e5dc474355a914f1dc84609620367d1c3ed9e04e50744074287dd4934ac7_340.jpg'},
    {name:'Secret Retreat',image:'https://pixabay.com/get/57e8d0424a5bae14f1dc84609620367d1c3ed9e04e50744074287dd4934ac7_340.jpg'}

]*/







/*Create table
app.get('/createtable', (req, res) => {
    let sql = 'CREATE TABLE showcomments(id int AUTO_INCREMENT, text VARCHAR(255), author VARCHAR(255), PRIMARY KEY(id), CampID int, FOREIGN KEY (CampID) REFERENCES campgrounds(id))';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('table created...');
    });
});*/

 
 /*Insert post 1
app.get('/add', (req, res) => {
    let comment = {text:"I agree...",author:'Lil',CampID:1};
    let sql = 'INSERT INTO showcomments SET ?';
    let query = db.query(sql, comment, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('added...');
    });
});*/





app.get('/',function(req,res){
    res.render('campgrounds/Landing.ejs',{user:req.user,msg:req.query.e})
    
})

app.get('/test',function(req,res){
    res.render('campgrounds/test.ejs',{user:req.user,msg:req.query.e,green:req.flash('green')})
    
})















app.listen(port, () => {
    console.log(`Server has started on port: ${port}`);
});

module.exports = db