// Cross-browser utilities for audio compatibility and page lifecycle
// These helpers optimize audio startup on iOS/Safari/Chrome and reduce glitches

(function () {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    function getCtx() {
        try {
            if (typeof getAudioContext === 'function') {
                // p5.sound global helper
                return getAudioContext();
            }
        } catch (e) {}
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) {
                if (!window.__audcog_audio_ctx) {
                    window.__audcog_audio_ctx = new Ctx({ latencyHint: 'interactive' });
                }
                return window.__audcog_audio_ctx;
            }
        } catch (e) {}
        return null;
    }

    let unlocked = false;

    function playSilentTick(ctx) {
        try {
            // Minimal silent tick to unlock iOS audio
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.0001;
            osc.connect(gain).connect(ctx.destination);
            if (osc.start) osc.start(0);
            if (osc.stop) osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
    }

    function resumeAudio() {
        const ctx = getCtx();
        if (!ctx) return false;
        if (ctx.state === 'suspended') {
            return ctx.resume().then(() => {
                playSilentTick(ctx);
                unlocked = true;
                return true;
            }).catch(() => false);
        } else {
            playSilentTick(ctx);
            unlocked = true;
            return Promise.resolve(true);
        }
    }

    function unlockOnFirstGesture() {
        if (unlocked) return;
        const handler = () => {
            resumeAudio();
            document.removeEventListener('touchend', handler, true);
            document.removeEventListener('mousedown', handler, true);
            document.removeEventListener('keydown', handler, true);
        };
        document.addEventListener('touchend', handler, true);
        document.addEventListener('mousedown', handler, true);
        document.addEventListener('keydown', handler, true);
    }

    function installVisibilityHandling() {
        const ctx = getCtx();
        if (!ctx) return;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                try { ctx.suspend(); } catch (e) {}
            } else {
                resumeAudio();
                // Reacquire wake lock when returning
                requestWakeLock();
            }
        });
        // iOS pagehide fires when tab changes
        window.addEventListener('pagehide', () => { try { ctx.suspend(); } catch (e) {} });
        window.addEventListener('pageshow', () => { resumeAudio(); requestWakeLock(); });
    }

    // Screen Wake Lock API
    let wakeLock = null;
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                if (wakeLock) return wakeLock;
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => { wakeLock = null; });
                return wakeLock;
            }
        } catch (e) {
            wakeLock = null;
        }
        return null;
    }
    async function releaseWakeLock() {
        try {
            if (wakeLock) { await wakeLock.release(); wakeLock = null; }
        } catch (e) {}
    }

    // Orientation lock (best-effort)
    async function lockOrientation(orientation) {
        try {
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock(orientation || 'landscape');
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Unload guard during tasks
    let taskActive = false;
    function setTaskActive(active) {
        taskActive = !!active;
    }
    function installUnloadGuard() {
        window.addEventListener('beforeunload', function (e) {
            if (taskActive) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    function requestFullscreenSafely(element) {
        const el = element || document.documentElement;
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
        return Promise.resolve();
    }

    function isAudioReady() {
        const ctx = getCtx();
        return !!ctx && ctx.state === 'running';
    }

    window.AudcogUtils = {
        isIOS,
        isSafari,
        isAudioReady,
        installAudioUnlock: unlockOnFirstGesture,
        unlockAudio: () => resumeAudio(),
        installVisibilityHandling,
        requestFullscreenSafely,
        getAudioContextCompat: getCtx,
        requestWakeLock,
        releaseWakeLock,
        lockOrientation,
        installUnloadGuard,
        setTaskActive
    };

    // Auto-install unlock listeners and visibility/unload handling early
    unlockOnFirstGesture();
    installVisibilityHandling();
    installUnloadGuard();
})();
