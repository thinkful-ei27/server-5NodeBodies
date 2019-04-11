function videoValidate (videoURL){
    let videoID;
  
    //https://youtu.be/g72SmMdFBpk
    //https://www.youtube.com/watch?v=g72SmMdFBpk
    //https://www.youtube.com/embed/g72SmMdFBpk
  
    if (videoURL.includes("watch")) {
      let indexOf = videoURL.indexOf('?v=')
      videoID = videoURL.slice(indexOf + 3)
  
    } else if (videoURL.includes("embed")) {
      let indexOf = videoURL.indexOf('embed/')
      videoID = videoURL.slice(indexOf + 6)
    } else if ((videoURL.includes("youtu.be"))){
      let indexOf = videoURL.indexOf('.be/')
      videoID = videoURL.slice(indexOf + 4)
    }
    return outputString
  }



/*return createNewNode(headNode)
    .then((_res) => {
      if (_res) {

        const nodeId = _res.id
        //somehow we have to hash the password and store it in the adventureObj
        const adventureObj = {
          title,
          startContent,
          startVideoURL,
          head: nodeId,
          nodes: [nodeId],
          creator: username,
          creatorId: userId,
          hasPassword
        }
        console.log(adventureObj);
        //If a password exists, we hash it to store the hash instead of plaintext
        if (password) {
          return Adventure.hashPassword(password)
            .then(hash => {
              adventureObj.password = hash;
              return Adventure.create(adventureObj);
            })
        } else {
          //Adventures with no password route
          return Adventure.create(adventureObj)
        }
      } else next();
    })
    .then((_res) => {
      if (_res) {
        adventureId = _res.id
        adventure = _res
        return User.findOne({ _id: userId })
      } else next();
    })
    .then((_res) => {
      const adventureArr = _res.adventures
      return User.findOneAndUpdate(
        { _id: userId },
        { adventures: [...adventureArr, adventureId] }
      )
    })
    .then((_res) => {
      return Adventure.findOne({ _id: adventureId }).populate('nodes').populate('head')
    })
    .then((_res) => {
      return res.json(_res)
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('You already have an Adventure with this title. Pick a unique title!');
        err.status = 400;
      }
      next(err);
    });*/

    // function videoValidate(videoURL) {
//   let videoID;

//   if (videoURL.includes("watch")) {
//     let indexOf = videoURL.indexOf('?v=')
//     videoID = videoURL.slice(indexOf + 3)
//     console.log(videoID);

//   } else if (videoURL.includes("embed")) {
//     let indexOf = videoURL.indexOf('embed/')
//     videoID = videoURL.slice(indexOf + 6)
//     console.log(videoID);
//   } else if ((videoURL.includes("youtu.be"))) {
//     let indexOf = videoURL.indexOf('.be/')
//     videoID = videoURL.slice(indexOf + 4)
//     console.log(videoID);
//   }
//   let outputString = `https://www.youtube.com/embed/${videoID}`
//   return outputString
// }
