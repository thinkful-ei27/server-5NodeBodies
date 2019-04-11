const nodes = [
  {
    "_id" : "5ca8f7b6c13a5f124cd6eff5",//
    "parents" : [
      null,
      "5ca8f7b6c13a5f124cd6eff6"//
    ],
    "title" : "good morning",
    "question" : "What is the first thing you do",
    "answerB" : "turn on the kurig",
    "answerA" : "start boiling water for coffee",
    "answerC" : "open the fridge",
    "answerD" : "look in the pantry",
    "textContent" : "You wake up groggy but rested. You walk down stairs to start making breakfast.",
    "ending" : false,
    "pointerB" : "5ca8f7b6c13a5f124cd6eff6",//
    "pointerA" : "5ca8f7b6c13a5f124cd6eff8",//
    "pointerD" : "5ca8f7b6c13a5f124cd6effc", //
    "pointerC" : "5ca8f7b6c13a5f124cd6effe", //
    "count" : 3,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6eff6",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff5"//
    ],
    "title" : "kurig",
    "question" : "How do you handle it",
    "answerB" : "Ignore science and common sense and embrace your your hubris.",
    "answerA" : "Realize that single use products like these are bad for the planet and rethink your life choices.",
    "textContent" : "After years of injesting coffee  dripped through layers of mixed plastic, the trace amounts of petroleum products in cells cause a wave of nausea and confusion",
    "pointerA" : "5ca8f7b6c13a5f124cd6eff5",//
    "pointerB" : "5ca8f7b6c13a5f124cd6eff7",//
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6eff7",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff6"//
    ],
    "title" : "Planetary destruction",
    "textContent" : "you destroyed millenia of society and millions of years of biodiversity because you  are inflexible when science tells you that continued unrestricted consumption of petroleum products will be devastating for future generations' life outcomes .\nThe 100 years of modern society was worth it though perhaps.  ",
    "videoURL" : "https://www.youtube.com/embed/hllU9NEcJyg",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6eff8",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff5"//
    ],
    "title" : "Stove",
    "question" : "What do you do",
    "answerB" : "check to see if the stove is actually lit",
    "answerA" : "See what the dog is doing wrong, get distracted,  check your email",
    "answerC" : "look at the expiration date of the coffee to see if it went bad",
    "textContent" : "you turn on the stove and start looking for the beans you start to smell a funny odor",
    "pointerA" : "5ca8f7b6c13a5f124cd6eff9",//
    "pointerB" : "5ca8f7b6c13a5f124cd6effa",//
    "pointerC" : "5ca8f7b6c13a5f124cd6effb",//
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6eff9",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff5"//
    ],
    "title" : "gas explosion",
    "textContent" : "After 45 minutes of browsing the internet for memes, you realize what you smell is gas. just then there is a loud boom. when you come to, you and your dog are uninjured, but there is a crater where your kitchen used to be, and you are still hungry.",
    "videoURL" : "https://www.youtube.com/embed/dmO4wRxtkHE",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6effa",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff8",//2
      "5ca8f7b6c13a5f124cd6effa",//
    
    ],
    "title" : "finish coffee",
    "question" : "What do you do next",
    "answerB" : "walk out on the porch to plan your epic meal.",
    "answerA" : "Decide you should just drink coffee and eat some crackers or something",
    "answerC" : "open the  fridge to get the eggs",
    "textContent" : "Everything is ok, and the water is almost ready to boil you put the coffee in the pour over cone and slowly pour water over it",
    "pointerC" : "5ca8f7b6c13a5f124cd6effe",//
    "pointerA" : "5ca8f7b6c13a5f124cd6f000",//
    "pointerB" : "5ca8f7b6c13a5f124cd6f004",//
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6effb",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6eff8"//
    ],
    "title" : "gas scare",
    "question" : "Whats next",
    "answerB" : "finish making coffee, life doesn't begin without coffee",
    "answerA" : "turn off the stove, its too early for this. go to the pantry for cereal",
    "textContent" : "coffee is still fresh, but when you look back at the stove you realize that there are no flames and gas is flowing into the room. with a expect flick and throw of a match you light the gas with a large flare of the flame",
    "pointerB" : "5ca8f7b6c13a5f124cd6effa",//
    "pointerA" : "5ca8f7b6c13a5f124cd6effc",//
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6effc",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effb",//
      "5ca8f7b6c13a5f124cd6eff5"//
    ],
    "title" : "Pantry",
    "question" : "What do you do",
    "answerB" : "flapjacks friday! (errr,  actually saturday)",
    "answerA" : "just grab the cereal as planned, no reason to get to ambitious. ",
    "answerC" : "remember the This American Life 's Serial podcast and decide to start playing it as you cook. you go grab your smartphone",
    "answerD" : "You Decide to go for the big meal, and grab the flour and the cookbook.",
    "textContent" : "Thinking about cereal\nyou open the pantry doors and have a look. you see cereal, pancake mix, and also the baking supplies your more successful meal prepping  friend encouraged you to get",
    "pointerC" : "5ca8f7b6c13a5f124cd6effd",//
    "pointerA" : "5ca8f7b6c13a5f124cd6efff",//
    "pointerD" : "5ca8f7b6c13a5f124cd6f005",//
    "pointerB" : "5ca8f7b6c13a5f124cd6f006",//
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6effd",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effc"//
    ],
    "title" : "Serial",
    "textContent" : "Instead of making breakfast, You end up binge watching the whole first season before you know it, subsising on water crackers, and water.  it was worth it. psst, there are three seasons!",
    "videoURL" : "https://www.youtube.com/embed/nMSxiHuDa00&list=PLYApml9ZfRZ4aap6-vl9-hSHjcXUU4FK-",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6effe",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effa",//
      "5ca8f7b6c13a5f124cd6eff5"//
    ],
    "title" : "Fridge",
    "question" : "what do you do",
    "answerB" : "go to the store for eggs",
    "answerA" : "grab milk for cereal",
    "answerC" : "forget it, crackers it is",
    "textContent" : "you open the fridge, and see you do not have any eggs",
    "pointerA" : "5ca8f7b6c13a5f124cd6efff",//
    "pointerC" : "5ca8f7b6c13a5f124cd6f000",//
    "pointerB" : "5ca8f7b6c13a5f124cd6f003",//
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6efff",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effc",//
      "5ca8f7b6c13a5f124cd6effe"//
    ],
    "title" : "Cereal",
    "textContent" : "you sit down at the table, eat your bowl of raisin bran or frosted flakes or chex or whatever, and think about how summers around the corner, and it's a nice day.",
    "videoURL" : "https://www.youtube.com/embed/low6Coqrw9Y",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f000",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effa",//
      "5ca8f7b6c13a5f124cd6effe"//
    ],
    "title" : "Crackers",
    "question" : "what do you do",
    "answerB" : "finish your crackers and go for a walk",
    "answerA" : "give the dog crackers",
    "textContent" : "Munching on crackers and drinking black coffee, you sit on the couch. your dog comes over to you and begs for crackers",
    "pointerB" : "5ca8f7b6c13a5f124cd6f001",//
    "pointerA" : "5ca8f7b6c13a5f124cd6f002",//
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f001",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6f000",//
      "5ca8f7b6c13a5f124cd6f001"//
    ],
    "title" : "Park",
    "textContent" : "You grab a leash and walk your dog to the park . you bring a book and buy a gyro. its a good day",
    "videoURL" : "https://www.youtube.com/embed/RUfqm71vfkk",
    "ending" : true,
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f002",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6f000"//
    ],
    "title" : "movie",
    "textContent" : "you sneak the dog a cracker or two and decide itll be a lazy day, so you cuddle up and watch a movie",
    "videoURL" : "https://www.youtube.com/embed/g-xEi1qDS74",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f003",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effe"//
    ],
    "title" : "store",
    "textContent" : "you leave to go get eggs, but then decide to go to the bar for bloody marys instead. there was a group of people who were celebrating a birthday and taking tequila shots. you joined in. not sure what happened after that but it was a good time.",
    "videoURL" : "https://www.youtube.com/embed/12UiEh2dFE8",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f004",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effa"//
    ],
    "title" : "Porch",
    "question" : "what do you do",
    "answerB" : "decide to go to the park",
    "answerA" : "stay focused, make the meal",
    "answerC" : "go look at the butterflies",
    "textContent" : "you think about making a delicious meal , but you also start thinking about the park,  and you also see some cool butterflies that you want to look at",
    "pointerB" : "5ca8f7b6c13a5f124cd6f001",//
    "pointerA" : "5ca8f7b6c13a5f124cd6f005",//
    "pointerC" : "5ca8f7b6c13a5f124cd6f007",//
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f005",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effc",//
      "5ca8f7b6c13a5f124cd6f004"//
    ],
    "title" : "Epic meal",
    "textContent" : "you make an epic meal and end up having enough biscuts left over for the next week. better buy some jam!",
    "videoURL" : "https://www.youtube.com/embed/jQX2kC1jUB8&list=PL84FBB60DFE42481F&index=61",
    "ending" : true,
    "count" : 1,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f006",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6effc"//
    ],
    "title" : "flapjacks",
    "textContent" : "You flippin, you flapin, and you trickin with the jacks!",
    "videoURL" : "https://www.youtube.com/embed/JRz4rO6mxEI",
    "ending" : true,
    "__v" : 0
  },
  {
    "_id" : "5ca8f7b6c13a5f124cd6f007",//
    "parents" : [
      "5ca8f7b6c13a5f124cd6f004"//
    ],
    "title" : "butterflies ",
    "textContent" : "nature is cool, you can eat some food later!",
    "videoURL" : "https://www.youtube.com/embed/T9sz9QzsWXc",
    "ending" : true,
    "__v" : 0
  }
]

const adventures = [
  {
    "_id" : "5ca8f7b6c13a5f124cd6f008",
    "nodes" : [
      "5ca8f7b6c13a5f124cd6eff5",
      "5ca8f7b6c13a5f124cd6eff6",
      "5ca8f7b6c13a5f124cd6eff7",
      "5ca8f7b6c13a5f124cd6eff8",
      "5ca8f7b6c13a5f124cd6eff9",
      "5ca8f7b6c13a5f124cd6effa",
      "5ca8f7b6c13a5f124cd6effb",
      "5ca8f7b6c13a5f124cd6effc",
      "5ca8f7b6c13a5f124cd6effd",
      "5ca8f7b6c13a5f124cd6effe",
      "5ca8f7b6c13a5f124cd6efff",
      "5ca8f7b6c13a5f124cd6f000",
      "5ca8f7b6c13a5f124cd6f001",
      "5ca8f7b6c13a5f124cd6f002",
      "5ca8f7b6c13a5f124cd6f003",
      "5ca8f7b6c13a5f124cd6f004",
      "5ca8f7b6c13a5f124cd6f005",
      "5ca8f7b6c13a5f124cd6f006",
      "5ca8f7b6c13a5f124cd6f007"
    ],
    "title" : "Making breakFast",
    "startContent" : "learn breakfast intro 101 crash course",
    "startVideoURL" : "https://www.youtube.com/embed/S7cI5sagPco",
    "hasPassword" : false,
    "count" : 2,
    "creatorId" : "5ca8f7b6c13a5f124cd6f009",
    "creator" : "cavyparty",
    "head" : "5ca8f7b6c13a5f124cd6eff5",
    "__v" : 0
  }  
]

const users = [
  {
    "_id" : "5ca8f7b6c13a5f124cd6f009",
    "firstName" : "cavy",
    "lastName" : "party",
    "adventures" : [
      "5ca8f7b6c13a5f124cd6f008"
    ],
    "username" : "cavyparty",
    "password" : "$2a$10$h06hHApD/7hdEJ.m.fDq9eM/Ty/HA0zaiAdtQqXn/ZAywg8hBgEcG",
    "__v" : 0
  }
  ]

module.exports = {
  nodes,
  users,
  adventures,
};