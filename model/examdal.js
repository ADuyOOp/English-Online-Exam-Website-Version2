const { sql,poolPromise } = require('../model/dbutil')

const fs = require('fs');
var rawdata = fs.readFileSync('./query/queries.json');
var queries = JSON.parse(rawdata);

const exam = require('../entity/exam')

class ExamModel {
    async  ListAllExam()  {
        var arrExam = []

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getAllExam)
            if (result != null) {
            for (var i = 0; i < result.rows.length; i++) {
                let row = result.rows[i]
                arrExam.push(new exam.create(row.exam_id, row.total_question, row.duration, row.skill_id))
                } 
            }  
        } catch (error) {
            console.log(error.message)
        }  

        return arrExam
    }

    async ListExam(examID) {
        var sid = examID
        var Exam = null;

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getExam, [sid])
            if (result != null){
                let row = result.rows[0]
                Exam = new exam.create(row.exam_id, row.total_question, row.duration, row.skill_id)
            }     
        } catch (error) {
            console.log(error.message)
        }     
    
        return Exam
    }

    async ListExamBySkill(skillID ) {
        var sid = skillID
        var arrExam = []

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getExamBySkill, [sid])
            if (result != null) {
            for (var i = 0; i < result.rows.length; i++) {
                let row = result.rows[i]
                arrExam.push(new exam.create(row.exam_id, row.total_question, row.duration, row.skill_id))
                } 
            }  
        } catch (error) {
            console.log(error.message)
        }  
    
        return arrExam
    }

    /*************************************** prac 2  **************************************************/
    async RemoveExam(examID) {
        var sid = examID
        try {
            const pool = await poolPromise
            const result = await pool.query(queries.deleteExam, [sid])
        } catch (error) {
            console.log(error.message)
        }  
    }

    // Insert new Exam wih exam parameter
    async InsertExam(Exam) {
        var tExam = null

        const text = queries.insertExam
        const values = [Exam.Tquestion, Exam.Duration, Exam.Skillid]

        try {
            const pool = await poolPromise
            const result = await pool.query(text, values)
            if (result != null) {
                tExam = result.rows[0]
            }
        } catch (error) {
            console.log(error.message)
        }  

        return tExam
    }

    async GetLastExam() {
        var examID = 0

        try {
            const pool = await poolPromise
            const result = await pool.query(queries.getLastExam, [])
            if (result != null){
                let row = result.rows[0]
                examID = row.max
            }     
        } catch (error) {
            console.log(error.message)
        }     

        return examID    
    }

}

const exammod = new ExamModel()
module.exports = exammod;

// module.exports = {ListAllExam}
