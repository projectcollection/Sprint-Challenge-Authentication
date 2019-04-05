const axios = require('axios');
const jwt = require('jsonwebtoken');

const { authenticate, jwtKey } = require('../auth/authenticate');
const db = require('../database/dbhelpers');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

async function register(req, res) {
  // implement user registration
  const {username, password} = req.body;

  if(!username || !password){
    res.status(401).json('incomplete credentials');
    return;
  } else {
    try {
      const [id] = await db.addUser({username, password});
      if(id){
        res.status(201).json('successfully registered');
      } 
    } catch (error) {
      res.status(500).json('server error');
    }
  }
}

async function login(req, res) {
  // implement user login
  const {username, password} = req.body;
  if (!username || !password) {
    res.status(401).json('incomplete credentials');
  } else {
    const auth = await db.authenticate({username, password});
    if(auth.isAuthed){
      const token = generateJWTToken(auth.user)
      res.status(200).json({
        message:`go get dem dadjokes ${auth.user.username}`,
        token 
      })
    } else {
      res.status(401).json('invalid credentials')
    }
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

function generateJWTToken(user){
  const payload = {
    subject: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, jwtKey, options);
}
