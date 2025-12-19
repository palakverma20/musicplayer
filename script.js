let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "00:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// new helper to reuse UI update
function updateSongTime() {
  document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )}/ ${secondsToMinutesSeconds(currentSong.duration)}`;
}

async function getSong(folder) {
  currFolder=folder.split("/")[1];
  currFolder=currFolder.replaceAll(" ","%20");
  // console.log(currFolder);
  // let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`%5Csongs%5C${currFolder}%5C`)[1]);
      // songs.push(element.href.split("%5Csongs%5C")[1]);
    }
  } 

  //Show all the songs in the playlist
  let SongUL = document.querySelector(".list").getElementsByTagName("ul")[0];
  SongUL.innerHTML="";
  for (const song of songs) {
    let s=song.replaceAll("%20", " ");
    let len=s.length;
    s=s.slice(0,length-4);
    SongUL.innerHTML =
      SongUL.innerHTML +
      `<li>
        <img class="hello" src="assets/music.svg" alt="">
                        <div class="info1">
                            <div class="info">
                                <div> ${s}</div>
                                <div class="artist">Palak Verma</div>
                            </div>
                            <div class="playNow">
                                <span class="hello2">Play Now</span>
                                <img class="hello3" src="assets/play3.svg" alt="">
                            </div>
                        </div>
        </li>`;
  }

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      let m = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim()
        .replaceAll(" ", "%20");
      m=m+".mp3"
      playMusic(m);
    });
  });
  // console.log(songs)
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `%5Csongs%5C${currFolder}%5C` + track;
  currentSong.preload = "metadata"; // ask browser to load metadata (duration)
  let s=track.replaceAll("%20", " ");
    let len=s.length;
    s=s.slice(0,length-4);
  document.querySelector(".songInfo").innerHTML = `${s}`;
  // document.querySelector(".songInfo").innerHTML = `${track.replaceAll("%20"," ")}`;
  updateSongTime(); // will show 00:00 until metadata loads
  if (!pause) {
    currentSong.play();
    play.src = "assets/pause1.svg";
  } else {
    play.src = "assets/play3.svg";
  }
};

async function displayAlbums() {
  // let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div=document.createElement("div");
  div.innerHTML=response;
  let anchors=div.getElementsByTagName("a");
  Array.from(anchors).forEach(e=>{
    if(e.href.includes("%5Csongs%5C")){
      let p=e.href.split("%5C")[2];
      p=p.replaceAll("%20"," ");
      p=p.replaceAll("/","")
      console.log(p);
    }
  })
}

async function main() {
  //Get songs
  songs=await getSong("songs/Love Tunes");
  playMusic(songs[0], true);

  //Show all the songs in hte playlist
  // let SongUL = document.querySelector(".list").getElementsByTagName("ul")[0];
  // SongUL.innerHTML="";
  // for (const song of songs) {
  //   let s=song.replaceAll("%20", " ");
  //   let len=s.length;
  //   s=s.slice(0,length-4);
  //   SongUL.innerHTML =
  //     SongUL.innerHTML +
  //     `<li>
  //       <img class="hello" src="assets/music.svg" alt="">
  //                       <div class="info1">
  //                           <div class="info">
  //                               <div> ${s}</div>
  //                               <div class="artist">Palak Verma</div>
  //                           </div>
  //                           <div class="playNow">
  //                               <span class="hello2">Play Now</span>
  //                               <img class="hello3" src="assets/play3.svg" alt="">
  //                           </div>
  //                       </div>
  //       </li>`;
  // }

  // //Attach an event listener to each song
  // Array.from(
  //   document.querySelector(".list").getElementsByTagName("li")
  // ).forEach((e) => {
  //   e.addEventListener("click", (element) => {
  //     let m = e
  //       .querySelector(".info")
  //       .firstElementChild.innerHTML.trim()
  //       .replaceAll(" ", "%20");
  //     m=m+".mp3"
  //     playMusic(m);
  //   });
  // });

  //Display all albums on the page
  displayAlbums()

  //Attach event listener to play,next and prev
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assets/pause1.svg";
    } else {
      currentSong.pause();
      play.src = "assets/play3.svg";
    }
  });

  //Add event listener for timeupdate
  currentSong.addEventListener("timeupdate", () => {
    //console.log(currentSong.currentTime,currentSong.duration);
    updateSongTime();
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // update UI once duration is known
  currentSong.addEventListener("loadedmetadata", updateSongTime);

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let xyz = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = xyz + "%";
    currentSong.currentTime = (currentSong.duration * xyz) / 100;
  });

  //Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".hamburger").style.display = "none";
    document.querySelector(".cross").style.display = "block";
  });
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".cross").style.display = "none";
    document.querySelector(".hamburger").style.display = "block";
  });

  //Add an event listener to hamburger1
  document.querySelector(".hamburger1").addEventListener("click", () => {
    document.querySelector("#login1").style.right = "0";
    document.querySelector(".hamburger1").style.display = "none";
    document.querySelector(".cross1").style.display = "block";
  });
  document.querySelector(".cross1").addEventListener("click", () => {
    document.querySelector("#login1").style.right = "-120%";
    document.querySelector(".cross1").style.display = "none";
    document.querySelector(".hamburger1").style.display = "block";
  });

  //Add event listener to prev and next
  prev.addEventListener("click",()=>{
    let cs=currentSong.src.split(`%5Csongs%5C${currFolder}%5C`)[1];
    let index=songs.indexOf(cs);
    let l=songs.length
    if(index>0){
      playMusic(songs[index-1])
    }
    else{
      playMusic(songs[l-1])
    }
  })
  next.addEventListener("click",()=>{
    // let cs=currentSong.src.split("%5Csongs%5C")[1];
    let cs=currentSong.src.split(`%5Csongs%5C${currFolder}%5C`)[1];
    let index=songs.indexOf(cs);
    let l=songs.length
    if((index+1)<l){
      playMusic(songs[index+1])
    }
    else{
      playMusic(songs[0])
    }
  })

  //Add event listener to volume
  document.querySelector(".range").addEventListener("change",(e)=>{
    currentSong.volume=parseInt(e.target.value)/100
    if(e.target.value==0){
      on.style.display="none"; 
      off.style.display="block"; 
    }
    else{
      on.style.display="block"; 
      off.style.display="none"; 
    }
  })

  //Load the PlayLists
  Array.from(document.getElementsByClassName("cards")).forEach((e)=>{
    e.addEventListener("click",async item=>{
      console.log(`${item.currentTarget.dataset.folder}`)
      songs=await getSong(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0],true)
    })
  })
}
main();
