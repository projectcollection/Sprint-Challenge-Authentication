const db = require('./dbConfig')
const bcrypt = require('bcryptjs')

const users = 'users'

const addUser = (userCreds) => {
    return db(users).insert({...userCreds, password: bcrypt.hashSync(userCreds.password, 4)});
}

const getUserBy = (filter) => {
    return db(users).where(filter).first();
}

const authenticate = (userCreds) => {
    const {username, password} = userCreds;
    return getUserBy({username}).then(user => {
        const isAuthed= bcrypt.compareSync(password, user.password);
        return {
            isAuthed,
            user
        }
    })
}

module.exports = {
    addUser,
    getUserBy,
    authenticate,
}