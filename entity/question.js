module.exports = {
    create: function (qid, content, stropt, result, ordques, testid, answer) {
        this.Quesionid = qid;
        // this.StrQuestionid = ''   
        this.Content = content;     
        this.StrOpt = stropt;      
        this.ArrOpt = [];    
        this.Result = result;
        this.Orderquestion = ordques;    

        this.StrOrderquestion = '';
        this.Answer = answer; 
        this.Testid = testid;                
    }
}