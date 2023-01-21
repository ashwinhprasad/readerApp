const bcrypt = require("bcrypt")

const generateHash = async (plainText) => {
    const salt = await bcrypt.genSalt(5)
    const hash = await bcrypt.hash(plainText, salt)
    return {hash, salt}
}

const compareHash = async (plainText, salt, cipher ) => {
    const plainTextHash = await bcrypt.hash(plainText,salt)
    if (plainTextHash == cipher) return true;
    return false; 
}

module.exports = {generateHash, compareHash}