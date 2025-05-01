module.exports = {
     create: function (pid, name, nquestion, eid) {
          this.Partid = pid;
          this.Partname  = name;
          this.Numquestion  = nquestion;
          this.Examid  = eid;

          Rightanswer = 0;
	     Ratio       = 0;

          this.ArrTest = [];
     }
}



