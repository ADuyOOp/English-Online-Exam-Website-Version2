const { sql,poolPromise } = require('../model/dbutil')

const fs = require('fs');
var rawdata = fs.readFileSync('./query/queries.json');
var queries = JSON.parse(rawdata);

const question = require('../entity/question')

class QuestionModel {
    /**** get array questions of test_id ****/
    async ListQuestions(testID) {
        var sid = testID
        var arrQues = []

        try {
            const pool =  await poolPromise
            const result =  await pool.query(queries.getListQuestion, [sid])
            if (result != null){
                for (var i = 0; i < result.rows.length; i++) {
                    let row = result.rows[i]
                    arrQues.push(new question.create(row.question_id, row.content, row.option, row.result, row.order_question, row.test_id, row.answer))
                }
            }                     
        } catch (error) {
            console.log(error.message)
        }  

        return arrQues
    }

    /**** update value to column answer of question table with question_id = qid ****/
    async UpdateQuestion(qid , ans)  {
        var rowaffected = 0

        try {
            const pool =  await poolPromise
            rowaffected = await pool.query(queries.updateQuestion, [ans,qid])                          
        } catch (error) {
            console.log(error.message)
        }  

        return rowaffected
    }

    /**** find question_id by order_question ****/
    async FindQuestion(qid , soq)  {
        var ques_id  = 0

        try {
            const pool =  await poolPromise
            const result =  await pool.query(queries.findQuestion, [qid, soq])
            if (result.rows.length != 0){
                let row = result.rows[0]
                ques_id = row.question_id
            }                     
        } catch (error) {
            console.log(error.message)
        }  

        return ques_id
    }

    /************************************* prac 2 ***************************************/
    /**** Insert new Question wih question parameter ****/
    async InsertQuestion(Question) {
        var con = Question.Content
        var option = Question.StrOpt
        var result = Question.Result
        var order_question = Question.Orderquestion
        var test_id = Question.Testid
        const values = [con,option,result,order_question,test_id]

        try {
            const pool =  await poolPromise
            const result =  await pool.query(queries.insertQuestion, values)
        } catch (error) {
            console.log(error.message)
        }  
    }
}

const questionmod = new QuestionModel()
module.exports = questionmod;

