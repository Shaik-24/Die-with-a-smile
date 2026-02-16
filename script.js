document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    const lyrics = document.querySelectorAll('#lyrics p');
    let activeIndex = -1;
    let isPlaying = false;

    /* ================= PLAY / PAUSE ================= */

    function togglePlay() {
        isPlaying ? pauseSong() : playSong();
    }

    function playSong() {
        if (isPlaying) return;
        isPlaying = true;

        audio.play().then(() => {
            updatePlayIcons(true);

            // ✅ FIX: sync lyrics immediately on play
            syncLyrics(audio.currentTime, true);
        }).catch(err => {
            console.error('Playback failed:', err);
            isPlaying = false;
        });
    }

    function pauseSong() {
        isPlaying = false;
        audio.pause();
        updatePlayIcons(false);
    }

    function updatePlayIcons(playing) {
        playIcon.classList.toggle('hidden', playing);
        pauseIcon.classList.toggle('hidden', !playing);
    }

    /* ================= PROGRESS + SEEK ================= */

    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration;

        if (!duration || isNaN(duration)) return;

        progressFill.style.width = `${(currentTime / duration) * 100}%`;
        currentTimeEl.innerText = formatTime(currentTime);
        durationEl.innerText = formatTime(duration);

        syncLyrics(currentTime);
    });

    // ✅ CLICK TO SEEK — FIXED
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * audio.duration;

        audio.currentTime = newTime;
        progressFill.style.width = `${percent * 100}%`;

        // 🔥 CRITICAL FIX
        syncLyrics(newTime, true);
    });

    /* ================= LYRICS SYNC ================= */

    function syncLyrics(currentTime, forceScroll = false) {
        for (let i = lyrics.length - 1; i >= 0; i--) {
            const lineTime = Number(lyrics[i].dataset.time);

            if (currentTime >= lineTime) {
                if (activeIndex !== i) {
                    if (activeIndex !== -1) {
                        lyrics[activeIndex].classList.remove('active');
                    }

                    lyrics[i].classList.add('active');
                    activeIndex = i;

                    lyrics[i].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                else if (forceScroll) {
                    // ensure scroll even if same lyric
                    lyrics[i].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                break;
            }
        }
    }

    function resetLyrics() {
        activeIndex = -1;
        lyrics.forEach(l => l.classList.remove('active'));
    }

    /* ================= UTILS ================= */

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    /* ================= EVENTS ================= */

    playBtn.addEventListener('click', togglePlay);

    document.getElementById('prev-btn').addEventListener('click', () => {
        audio.currentTime = 0;
        resetLyrics();
        if (isPlaying) audio.play();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        audio.currentTime = 0;
        resetLyrics();
        if (isPlaying) audio.play();
    });

    audio.addEventListener('ended', () => {
        pauseSong();
        audio.currentTime = 0;
        progressFill.style.width = '0%';
        resetLyrics();
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.innerText = formatTime(audio.duration);
    });
});
