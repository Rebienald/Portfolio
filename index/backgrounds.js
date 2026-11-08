(function initDualBackgrounds() {
    return;
    var gridCanvas = document.getElementById("cyberGridCanvas");
    var constCanvas = document.getElementById("constellationCanvas");
    if (!gridCanvas || !constCanvas) return;
    var gridCtx = gridCanvas.getContext("2d");
    var constCtx = constCanvas.getContext("2d");
    var w = 0,
        h = 0;
    var offsetZ = 0;
    var gridSpeed = 0.007;
    var particles = [];
    var mouse = {
        x: null,
        y: null,
        maxDist: 140,
    };
    var isMobile = window.innerWidth <= 768;
    function resize() {
        w = gridCanvas.width = constCanvas.width = window.innerWidth;
        h = gridCanvas.height = constCanvas.height = window.innerHeight;
        isMobile = w <= 768;
        initParticles();
    }
    function initParticles() {
        particles = [];
        var particleCount = isMobile ? 28 : Math.min(85, Math.floor((w * h) / 14e3));
        for (var i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
                vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
                radius: Math.random() * (isMobile ? 1.4 : 1.8) + 0.7,
                alpha: Math.random() * 0.45 + 0.3,
            });
        }
    }
    resize();
    window.addEventListener("resize", resize, {
        passive: true,
    });
    window.addEventListener(
        "mousemove",
        function (e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        },
        {
            passive: true,
        }
    );
    window.addEventListener(
        "touchmove",
        function (e) {
            if (e.touches && e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        },
        {
            passive: true,
        }
    );
    window.addEventListener(
        "touchend",
        function () {
            mouse.x = null;
            mouse.y = null;
        },
        {
            passive: true,
        }
    );
    window.addEventListener("mouseleave", function () {
        mouse.x = null;
        mouse.y = null;
    });
    var gridSectionIds = ["testimonials", "work", "expertise"];
    var currentBg = "constellation";
    function updateActiveBackground() {
        var midScreen = window.innerHeight * 0.5;
        var activeSectionId = null;
        var sections = document.querySelectorAll("section");
        for (var s = 0; s < sections.length; s++) {
            var rect = sections[s].getBoundingClientRect();
            if (rect.top <= midScreen && rect.bottom >= midScreen) {
                activeSectionId = sections[s].id;
                break;
            }
        }
        if (isMobile) {
            if (currentBg !== "constellation") {
                currentBg = "constellation";
                gridCanvas.style.opacity = "0";
                constCanvas.style.opacity = "1";
            }
            return;
        }
        var shouldUseGrid = gridSectionIds.indexOf(activeSectionId) !== -1;
        var targetBg = shouldUseGrid ? "grid" : "constellation";
        if (targetBg !== currentBg) {
            currentBg = targetBg;
            if (currentBg === "grid") {
                gridCanvas.style.opacity = "1";
                constCanvas.style.opacity = "0";
            } else {
                gridCanvas.style.opacity = "0";
                constCanvas.style.opacity = "1";
            }
        }
    }
    window.addEventListener("scroll", updateActiveBackground, {
        passive: true,
    });
    window.addEventListener("touchmove", updateActiveBackground, {
        passive: true,
    });
    updateActiveBackground();
    function render() {
        if (!isMobile) {
            gridCtx.clearRect(0, 0, w, h);
            var centerY = h * 0.5;
            var vanishX = w * 0.5;
            var grad = gridCtx.createRadialGradient(vanishX, centerY, 10, vanishX, centerY, Math.max(w, h) * 0.65);
            grad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
            grad.addColorStop(0.4, "rgba(160, 180, 220, 0.03)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            gridCtx.fillStyle = grad;
            gridCtx.fillRect(0, 0, w, h);
            var numCols = 32;
            var spread = w * 2.2;
            gridCtx.lineWidth = 1;
            for (var i = -numCols; i <= numCols; i++) {
                var targetX = vanishX + i * (spread / numCols);
                var alpha = Math.max(0.02, 0.16 - Math.abs(i) * 0.005);
                gridCtx.beginPath();
                gridCtx.moveTo(vanishX, centerY);
                gridCtx.lineTo(targetX, h);
                gridCtx.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
                gridCtx.stroke();
                gridCtx.beginPath();
                gridCtx.moveTo(vanishX, centerY);
                gridCtx.lineTo(targetX, 0);
                gridCtx.strokeStyle = "rgba(255, 255, 255, " + alpha * 0.65 + ")";
                gridCtx.stroke();
            }
            offsetZ = (offsetZ + gridSpeed) % 1;
            var numRows = 24;
            for (var j = 0; j < numRows; j++) {
                var progress = (j + offsetZ) / numRows;
                var eased = Math.pow(progress, 2);
                var pyBottom = centerY + eased * (h - centerY);
                var alphaBottom = Math.pow(progress, 1.6) * 0.22;
                gridCtx.beginPath();
                gridCtx.moveTo(0, pyBottom);
                gridCtx.lineTo(w, pyBottom);
                gridCtx.strokeStyle = "rgba(255, 255, 255, " + alphaBottom + ")";
                gridCtx.stroke();
                var pyTop = centerY - eased * centerY;
                var alphaTop = Math.pow(progress, 1.6) * 0.14;
                gridCtx.beginPath();
                gridCtx.moveTo(0, pyTop);
                gridCtx.lineTo(w, pyTop);
                gridCtx.strokeStyle = "rgba(255, 255, 255, " + alphaTop + ")";
                gridCtx.stroke();
            }
        }
        constCtx.clearRect(0, 0, w, h);
        var maxConnect = isMobile ? 85 : 120;
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            else if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            else if (p.y > h) p.y = 0;
            if (mouse.x !== null && mouse.y !== null) {
                var dx = p.x - mouse.x;
                var dy = p.y - mouse.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.maxDist) {
                    var force = (mouse.maxDist - dist) / mouse.maxDist;
                    p.x += (dx / dist) * force * 1.2;
                    p.y += (dy / dist) * force * 1.2;
                }
            }
            constCtx.beginPath();
            constCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            constCtx.fillStyle = "rgba(255, 255, 255, " + p.alpha + ")";
            constCtx.fill();
            for (var m = k + 1; m < particles.length; m++) {
                var p2 = particles[m];
                var djx = p.x - p2.x;
                var djy = p.y - p2.y;
                var pDist = Math.sqrt(djx * djx + djy * djy);
                if (pDist < maxConnect) {
                    var lineAlpha = (1 - pDist / maxConnect) * (isMobile ? 0.18 : 0.25);
                    constCtx.beginPath();
                    constCtx.moveTo(p.x, p.y);
                    constCtx.lineTo(p2.x, p2.y);
                    constCtx.strokeStyle = "rgba(255, 255, 255, " + lineAlpha + ")";
                    constCtx.lineWidth = isMobile ? 0.6 : 0.7;
                    constCtx.stroke();
                }
            }
            if (mouse.x !== null && mouse.y !== null) {
                var mdx = p.x - mouse.x;
                var mdy = p.y - mouse.y;
                var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                var mouseReach = isMobile ? 100 : 140;
                if (mDist < mouseReach) {
                    var mAlpha = (1 - mDist / mouseReach) * 0.45;
                    constCtx.beginPath();
                    constCtx.moveTo(p.x, p.y);
                    constCtx.lineTo(mouse.x, mouse.y);
                    constCtx.strokeStyle = "rgba(255, 255, 255, " + mAlpha + ")";
                    constCtx.lineWidth = 0.9;
                    constCtx.stroke();
                }
            }
        }
        requestAnimationFrame(render);
    }
    render();
})();

(function () {
    var secs = document.querySelectorAll("section, .contact-section");
    function updateFocus() {
        var mid = window.innerHeight * 0.5;
        var active = null;
        for (var i = 0; i < secs.length; i++) {
            var r = secs[i].getBoundingClientRect();
            if (r.top <= mid && r.bottom >= mid) {
                active = secs[i];
                break;
            }
        }
        for (var j = 0; j < secs.length; j++) {
            if (secs[j].classList) {
                secs[j].classList.toggle("in-focus", secs[j] === active);
            }
        }
    }
    window.addEventListener("scroll", updateFocus, {
        passive: true,
    });
    window.addEventListener("touchmove", updateFocus, {
        passive: true,
    });
    updateFocus();
})();
