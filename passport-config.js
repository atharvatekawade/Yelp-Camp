const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt');
let user;
function initialize(passport,getUserByUserName,getUserById){
    const authenticateUser= async (username,password,done) => {
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
    }



    passport.use(new LocalStrategy({ usernameField:'username',passwordField:'password' },authenticateUser))

    passport.serializeUser((user,done) => done(null,user.id))
    passport.deserializeUser((id,done) => {
        return done(null,getUserById(id))
    })
}

module.exports=initialize