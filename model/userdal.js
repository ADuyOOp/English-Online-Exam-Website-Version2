 const { sql,poolPromise } = require('../model/dbutil')

const fs = require('fs');
var rawdata = fs.readFileSync('./query/queries.json');
var queries = JSON.parse(rawdata);

const user = require('../entity/user')

class UserModel{
	// Get Account with name, pass parameter
	async GetUser(name, pass) {
		var User = null 

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getUser, [name,pass])
            if (result.rowCount != 0) {
                let row = result.rows[0]
				User = new user.create(row.user_id, row.username, row.pass, row.role)
            }  
        } catch (error) {
            console.log(error.message)
        }  
    
		return User
	}

	// Get Account with name, pass parameter
	async ListAllUser() {
		var arrUser = []

		try {
            const pool = await poolPromise
            const result = await pool.query(queries.getAllUser, [])
            if (result.rowCount != 0) {
				for (var i = 0; i < result.rows.length; i++) {
                    let row = result.rows[i]
                    arrUser.push(new user.create(row.user_id, row.username, row.pass, row.role))
                }
            }  
        } catch (error) {
            console.log(error.message)
        }  

		return arrUser
	}

	async InsertUser(User) {
		try {
            const pool = await poolPromise
            const result = await pool.query(queries.insertUser, [User.Name, User.Pass, User.Role])
        } catch (error) {
            console.log(error.message)       
		}  
	}

	async RemoveUser(userid) {
		try {
            const pool = await poolPromise
            const result = await pool.query(queries.removeUser, [userid])
        } catch (error) {
            console.log(error.message)       
		}  
	}	
	
	// Get Account with name, pass parameter
	async ListUser(id) {
		// coding within database
		var User = null

		try {
            const pool = await poolPromise
            const result = await pool.query(queries.getUserById, [id])
            if (result.rowCount != 0){
                let row = result.rows[0]
				User = new user.create(row.user_id, row.username, row.pass, row.role)
            }     
        } catch (error) {
            console.log(error.message)
        }     

		return User
	}

	async UpdateUser(User) {
		var values = [User.Name, User.Pass, User.Role, User.Userid]
		try {
            const pool = await poolPromise
            const result = await pool.query(queries.updateUser, values)
        } catch (error) {
            console.log(error.message)       
		}  
	}	

}

const usermod = new UserModel()
module.exports = usermod;
