module.exports = {
    create: function (tid, audio, image, text, ordtest, pid) {
        this.Testid = tid;
        this.Audio = audio;   
        this.Image = image;     
        this.Text = text;      
        this.Ordertest = ordtest;
        this.Partid = pid;    

        this.ArrQues = [];
        this.ArrFile = [];
    }
}