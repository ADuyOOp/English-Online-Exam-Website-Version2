const { sql,poolPromise } = require('../model/dbutil')

const fs = require('fs');
var rawdata = fs.readFileSync('./query/queries.json');
var queries = JSON.parse(rawdata);

const exam = require('../entity/exam')

class SkillModel {
    async GetSkillID(examID)  {
        var sid = Number(examID)
        var skillid = 0
    
        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getSkillID, [sid])
            if (result != null) {
                let row = result.rows[0]
                skillid = row.skill_id
            }  
        } catch (error) {
            console.log(error.message)
        }  
    
        return skillid
    }

    /**** get name by id ****/
    async GetSkillName(skillID) {
        var name =''

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getSkillName, [skillID])
            if (result != null) {
                let row = result.rows[0]
                name = row.skill_name
            }  
        } catch (error) {
            console.log(error.message)
        }  

        return name
    }
}

const skillmod = new SkillModel()
module.exports = skillmod;
