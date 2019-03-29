const nodes = {
  "_id" : "123456789123456789123456",
  "question" : "What is the meaning of life?",
  "leftAnswer" : "Food!",
  "rightAnswer" : "42!",
  "ending" : false,
}

const adventures = {
  "_id" : "987654321987654321987654",
  "title": "Adventure",
  "startContent": "Some cool Content",
  "head": "123456789123456789123456",
  "nodes" : ["123456789123456789123456"]
}

const users = {
  "username": "User",
  "password" : "TestTester",
  "name": "Test Tester",
  "adventures": ["987654321987654321987654"]
}

module.exports = {
  nodes,
  users,
  adventures,
};