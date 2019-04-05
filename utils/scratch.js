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
