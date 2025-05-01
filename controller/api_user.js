/*************************************** prac 4  **************************************************/
const userman = require('../controller/userman')
const userdal = require('../model/userdal')
const dialognode = require('dialog-node');
const user = require('../entity/user')

class UserControl{
    // manage user list /
    async ListAllUser(req, res) {
        /** non authentication coding **/
        // arrUser := model.ListAllUser()
        // c.HTML(http.StatusOK, "user_list.html", gin.H{"arrUser": arrUser})

        /** authentication coding **/
        var listrole = ["admin"]
        var session = req.session;
        var sessionID = session.sessionID
        var username = session.username

        if (sessionID == undefined) {  // user not sign in yet
            session.job = "user"
            var Message = "Sign in. Please !"
            // res.send(errMessage)
            res.render('login',{Message:Message}) //to user.GET("/login", user.LoginUser)
        } else {
            var author = await userman.AuthorUser(req, listrole)
            if (author) {
                var arrUser = await userdal.ListAllUser()
                res.render('user_list',{ArrUser: arrUser, Username: username})
            } else {
                dialognode.warn('Access denied.', '');  // user not righ permission
                res.redirect('/')   //go to Home
            }
        }
    }

    // make info new user account /
    async CreateUser(req, res) {
        /** Authentication coding **/
        var createrole = ["admin"]
        var session = req.session;
        var username = session.username
        var author = await userman.AuthorUser(req, createrole)
        if (author) {
            res.render('user_create',{Username: username})
        } else {
            dialognode.warn('Access denied.', '');  // user not righ permission
            res.redirect('/')   //go to Home
        }
    }

    // save info new user account to database /
    async AddUser(req, res) {
        var name = req.body.name
        var pass = req.body.password
        var role = req.body.role

        var User = new user.create("", name, pass, role)

        await userdal.InsertUser(User)

        res.redirect('/user/list')  // to user_list.html
    }

    // remove user account from database /
    async RemoveUser(req, res) {
        var removerole = ["admin"]
        var author = await userman.AuthorUser(req, removerole)
        if (author) {
            var sid = req.params["id"]
            var id = Number(sid)
            await userdal.RemoveUser(id)
            res.redirect('/user/list')  // to user_list.html
        } else {
            dialognode.warn('Access denied.', '');  // user not righ permission
            res.redirect('/')   //go to Home
        }
    }

    // edit info old user account /
    async EditUser(req, res) {
        /** non authentication coding **/
        // var sid = req.params["id"]
        // var id = Number(sid)
        // var User = await userdal.ListUser(id)
        // res.render('user_edit',{User:User})

        /** authentication coding */
        var removerole = ["admin"]
        var author = await userman.AuthorUser(req, removerole)
        var session = req.session;
        var username = session.username
        if (author) {
            var sid = req.params["id"]
            var id = Number(sid)
            var User = await userdal.ListUser(id)
            res.render('user_edit',{User:User, Username: username})
        } else {
            dialognode.warn('Access denied.', '');  // user not righ permission
            res.redirect('/')   //go to Home
        }
    }

    // save info old user account modified to database /
    async UpdateUser(req, res) {
        var sid = req.params["id"]
        var id = Number(sid)

        var name = req.body.name
        var pass = req.body.pass
        var role = req.body.role

        var User = new user.create(id, name, pass, role)

        await userdal.UpdateUser(User)

        res.redirect('/user/list')  // to user_list.html
    }

}

const usercon = new UserControl()
module.exports = usercon;
