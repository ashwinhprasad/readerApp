const fs = require("fs")

const logFilePath = "logs/application-logs.txt"

const addToLogs = async (content) => {
    fs.appendFile(logFilePath,content+"\n\n",(err) => {
        if (err) {
            console.log(err)
        }
    })
    
}

module.exports = addToLogs;