const mongoose = require('mongoose');

const connectDB = async () => {
    console.log(process.env.MONGO_URL)
    await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(() => {
        console.log("DB connection is successfull")
    }).catch((err) => {
        console.log("error in db connection", err.message) 
    })
}

module.exports = connectDB;
