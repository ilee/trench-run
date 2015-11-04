var isAudio;
var increase;

// ---------- Game ----------
var musicGame = null;
var soundCrash = null;

function initAudio() {
	
	increase = 0;
	
	if (musicGame == null)
	{
		musicGame = document.getElementById("music");
		
		if (mobile == 2) // iOS
			musicGame.src = "res/music.WAV";
		
		else
			musicGame.src = "res/music.OGG";
		
		musicGame.loop = true;
	}
	
	if (soundCrash == null)
	{
		soundCrash = document.getElementById("crash");
		soundCrash.src = "res/crash.OGG";
	}
}

function playAudio(ID) {
	
	if ((isAudio == true) && (mode == MODE_GAME))
	{
		if (ID == 0)
			musicGame.oncanplay = musicGame.play();
		
		if (ID == 1)
			soundCrash.oncanplay = soundCrash.play();
	}
}

function pauseAudio(rewind) {
	if ((isAudio) && (musicGame != null))
	{
		musicGame.pause();
		
		if (rewind == true)
			musicGame.currentTime = 0;
	}
}

function setVolume(vol) {
	if ((isAudio) && (musicGame != null))
		musicGame.volume = vol;
}

function setPBTime(time) {
	if ((isAudio) && (musicGame != null))
		musicGame.currentTime = time;
}
