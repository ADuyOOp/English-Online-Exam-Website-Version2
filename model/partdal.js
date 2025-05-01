const { sql,poolPromise } = require('../model/dbutil')

const fs = require('fs');
var rawdata = fs.readFileSync('./query/queries.json');
var queries = JSON.parse(rawdata);

const part = require('../entity/part')

class PartModel {
    /**** get array parts ****/
    async ListParts(examID) {
        var sid = examID
        var arrPart = []

        try {
            const pool =  await poolPromise
            const result =  await pool.query(queries.getListPart, [sid])
            if (result != null){
                for (var i = 0; i < result.rows.length; i++) {
                    let row = result.rows[i]
                    arrPart.push(new part.create(row.part_id, row.partname, row.num_question, row.exam_id))
                } 
            }                     
        } catch (error) {
            console.log(error.message)
        }  

        return arrPart
    }

    /*************************************** prac 2 ************************************************/

    /**** Insert new Part wih part parameter ****/
    async InsertPart(Part) {

        try {
            const pool =  await poolPromise
            const result =  await pool.query(queries.insertPart, [Part.Partname, Part.Numquestion, Part.Examid])
        } catch (error) {
            console.log(error.message)
        }  

    }

    /**** get max part_id ****/
    async GetLastPart()  {
        var partID = 0

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getLastPart, [])
            if (result != null){
                let row = result.rows[0]
                partID = row.max
            }     
        } catch (error) {
            console.log(error.message)
        }     

        return partID
    }
}

const partmod = new PartModel()
module.exports = partmod;

