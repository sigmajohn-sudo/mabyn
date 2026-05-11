// ===== INTERAKTYWNE GODŁO Z HOLOGRAMEM v5 LITE =====
// TYLKO zmiana kolorów hologramu, BEZ ruchu godła TOP

(function () {
  console.log("[Orzel] orzel.js loaded - COLORS ONLY");

  let orientationActive = false;
  let currentGamma = 0;
  let targetGamma = 0;
  let animationId = null;

  function initHologram() {
    const holos = document.querySelectorAll(".holo-back");
    const bases = document.querySelectorAll(".base-back");
    const tops = document.querySelectorAll(".godlo-top");

    console.log("[Orzel] Elements found:", {
      holo: holos.length,
      base: bases.length,
      top: tops.length
    });

    // Szare godło ZAWSZE widoczne
    bases.forEach((base) => {
      base.style.display = "block";
      base.style.opacity = "1";
    });

    // Godło TOP zawsze widoczne, BEZ transformacji
    tops.forEach((top) => {
      top.style.display = "block";
      top.style.opacity = "1";
      top.style.transform = "none";
    });

    // Hologram niewidoczny na starcie
    holos.forEach((holo) => {
      holo.style.opacity = "0";
      holo.style.backgroundPosition = "center 50%";
      holo.style.transition = "none";
    });

    console.log("[Orzel] Initialized - waiting for movement");
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animateHolo() {
    const holos = document.querySelectorAll(".holo-back");
    // const tops = document.querySelectorAll(".godlo-top"); // NIE RUSZAMY GODŁA

    animationId = requestAnimationFrame(animateHolo);

    if (!orientationActive || holos.length === 0) return;

    // Bardzo szybka reakcja
    currentGamma = lerp(currentGamma, targetGamma, 0.4);

    // Ograniczamy zakres do ±30° dla subtelniejszego efektu
    const clampedGamma = Math.max(-30, Math.min(30, currentGamma));
    const absGamma = Math.abs(clampedGamma);
    
    // Intensywność kolorów - szybko rośnie przy małym ruchu
    let intensity = 0;
    if (absGamma > 1) {
      intensity = Math.min(1, Math.pow(absGamma / 25, 1.2));
      intensity = Math.max(0.2, intensity); // Minimum widoczności
    }
    
    // Pozycja gradientu: -30° → 80%, 0° → 50%, +30° → 20%
    const position = 50 - (clampedGamma / 30) * 30;

    holos.forEach((holo) => {
      holo.style.backgroundPosition = `center ${position}%`;
      holo.style.opacity = intensity;
    });

    // BEZ ruchu godła TOP - zakomentowane
    // const shiftX = (-clampedGamma / 30) * 1.5;
    // tops.forEach((top) => {
    //   top.style.transform = `translateX(${shiftX}px)`;
    // });
  }

  function handleOrientation(e) {
    if (e.gamma !== null && e.gamma !== undefined) {
      targetGamma = e.gamma;
    }
  }

  function enableMotionSensor() {
    if (orientationActive) return;
    console.log("[Orzel] Motion sensor enabled");
    orientationActive = true;
    window.addEventListener("deviceorientation", handleOrientation, true);
  }

  function requestPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') enableMotionSensor();
        })
        .catch(console.error);
    } else {
      enableMotionSensor();
    }
  }

  function setupIOSPermission() {
    let done = false;
    function handler(e) {
      if (done) return;
      done = true;
      requestPermission();
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchstart', handler, true);
    }
    document.addEventListener('click', handler, true);
    document.addEventListener('touchstart', handler, true);
  }

  function bootstrap() {
    initHologram();
    
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      setupIOSPermission();
    } else {
      enableMotionSensor();
    }
    
    if (!animationId) {
      animationId = requestAnimationFrame(animateHolo);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      orientationActive = false;
    } else {
      orientationActive = true;
      currentGamma = 0;
      targetGamma = 0;
    }
  });

})();