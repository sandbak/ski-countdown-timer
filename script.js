// Set fixed date and time to January 29, 2025 16:30
const skiTripDate = new Date('2025-01-29T16:30:00');
document.getElementById('skiDate').valueAsDate = skiTripDate;
document.getElementById('skiDate').disabled = true;  // Make the date input readonly

let countdownInterval;

function updateCountdown() {
    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const calculateTimeLeft = () => {
        const targetDate = skiTripDate.getTime();  // Use our fixed date with time
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '0';
            document.getElementById('minutes').textContent = '0';
            document.getElementById('seconds').textContent = '0';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    };

    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    countdownInterval = setInterval(calculateTimeLeft, 1000);
}

// Create snow effect
function createSnowflakes() {
    const snowflakesContainer = document.querySelector('.snow-animation');
    const numberOfSnowflakes = 100;  // Increased number of snowflakes

    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Randomize starting position and animation duration
        const startLeft = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const size = Math.random() * 5 + 3;  // Slightly smaller snowflakes
        
        snowflake.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            left: ${startLeft}vw;
            top: -10px;
            animation: snowfall ${animationDuration}s linear infinite;
            opacity: ${Math.random() * 0.7 + 0.3};  // Adjusted opacity range
        `;
        
        const keyframes = `
            @keyframes snowfall {
                0% {
                    transform: translateY(-10px) rotate(0deg);
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframes;
        document.head.appendChild(styleSheet);
        
        snowflakesContainer.appendChild(snowflake);
    }
}

// Audio player setup
const playlist = [
    encodeURIComponent('Weißes Pulver - White Powdr Crew.mp3'),
    'Polvere Bianca - White Powdr Crew.mp3',
    'Polvere Bianca in Val Gardena - White Powder Crew.mp3',
    encodeURIComponent('White Powder - White Powdr Crew.mp3'),
    'White Powder Again - White Powdr Crew.mp3',
    'Weiße Pracht - White Powdr Crew.mp3',
    encodeURIComponent('Weißes Pulver Again - White Powdr Crew.mp3')
];
let currentTrackIndex = 0;
let audio = null;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (!audio || audio.paused) return;
    
    // Add checks for valid duration
    if (!audio.duration || isNaN(audio.duration)) {
        console.warn('Invalid duration:', audio.duration);
        return;
    }
    
    const percent = (audio.currentTime / audio.duration) * 100;
    const progressBar = document.querySelector('.progress');
    const currentTimeDisplay = document.querySelector('.current-time');
    
    if (progressBar && !isNaN(percent)) {
        progressBar.style.width = percent + '%';
    } else {
        console.warn('Invalid progress calculation:', {
            currentTime: audio.currentTime,
            duration: audio.duration,
            percent: percent
        });
    }
    
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }
}

function loadTrack(index) {
    if (audio) {
        audio.pause();
    }

    currentTrackIndex = index;
    const trackUrl = playlist[currentTrackIndex];
    
    // Update track title
    const trackName = decodeURIComponent(trackUrl).replace('.mp3', '');
    document.querySelector('.track-title').textContent = trackName;

    // Update playlist highlighting
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === currentTrackIndex);
    });

    // Create new audio instance
    audio = new Audio(trackUrl);
    audio.volume = 1.0;

    // Add error handling for audio loading
    audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        console.error('Error details:', audio.error);
    });

    // Set up audio events
    audio.addEventListener('timeupdate', updateProgress);
    
    audio.addEventListener('loadedmetadata', () => {
        console.log('Track loaded:', trackUrl);
        console.log('Duration:', audio.duration);
        document.querySelector('.duration').textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        playNextTrack();
    });

    // Add canplay event to ensure audio is ready
    audio.addEventListener('canplay', () => {
        console.log('Track can play:', trackUrl);
    });

    return audio;
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex).play()
        .then(() => updatePlayButton(true))
        .catch(error => console.log('Playback prevented. Click to play.'));
}

function playPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex).play()
        .then(() => updatePlayButton(true))
        .catch(error => console.log('Playback prevented. Click to play.'));
}

function updatePlayButton(isPlaying) {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    playIcon.style.display = isPlaying ? 'none' : 'inline';
    pauseIcon.style.display = isPlaying ? 'inline' : 'none';
}

function setupAudioPlayer() {
    const playButton = document.getElementById('playButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const progressBar = document.querySelector('.progress-bar');
    
    // Create playlist UI
    const playlistContainer = document.querySelector('.playlist');
    playlist.forEach((track, index) => {
        const trackName = decodeURIComponent(track).replace('.mp3', '');
        const trackElement = document.createElement('div');
        trackElement.className = 'playlist-item' + (index === 0 ? ' active' : '');
        trackElement.textContent = trackName;
        trackElement.addEventListener('click', () => {
            loadTrack(index).play()
                .then(() => updatePlayButton(true))
                .catch(error => console.log('Playback prevented. Click to play.'));
        });
        playlistContainer.appendChild(trackElement);
    });

    // Load first track
    loadTrack(0);

    // Handle progress bar clicks
    progressBar.addEventListener('click', (e) => {
        if (!audio) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
        updateProgress();
    });

    // Play/Pause button
    playButton.addEventListener('click', () => {
        if (!audio) return;
        
        if (audio.paused) {
            audio.play().then(() => updatePlayButton(true));
        } else {
            audio.pause();
            updatePlayButton(false);
        }
    });

    // Previous/Next buttons
    prevButton.addEventListener('click', playPreviousTrack);
    nextButton.addEventListener('click', playNextTrack);

    // Try to autoplay first track
    audio.play()
        .then(() => updatePlayButton(true))
        .catch(error => console.log('Autoplay prevented. Click to play.'));
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    createSnowflakes();
    setupAudioPlayer();
});
