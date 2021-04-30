function addLoadEvent(callback) {
    let oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = callback;
    } else {
        window.onload = function() {
            oldonload();
            callback();
        }
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

let setLinksHref = function() {
    let iconLink = document.querySelector('link[rel="icon"]');
    setHref(iconLink, 164, 164, "140px", -12, 134)

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    setHref(appleIcon, 180, 180, "80px", 70, 94, "#fff")

    function setHref(element, height, width, fontSize, x, y, bg) {
        if (element) {
            let favicon = element.dataset.favicon

            element.removeAttribute("data-favicon")

            element.href = dataUrl(favicon, height, width, fontSize, x, y, bg);
        }
    }

    function dataUrl(favicon, height, width, fontSize, x, y, bg) {
        let canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;

        let context = canvas.getContext('2d');

        if (bg) {
            context.fillStyle = bg;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.font = `${fontSize} serif`;
        context.fillText(favicon, x, y);

        return canvas.toDataURL();
    }
}
addLoadEvent(setLinksHref)

let copyBtnCallback = function() {
    for (const highlight of document.querySelectorAll(".highlight")) {
        let copyBtn = document.createElement('div');
        copyBtn.innerHTML = '复制';
        copyBtn.setAttribute("class", "copyCode")

        copyBtn.onclick = () => {
            let textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.innerHTML = highlight.querySelector("code[data-lang]").textContent;
            textarea.select();
            if (document.execCommand('copy')) {
                document.execCommand('copy');
            }
            document.body.removeChild(textarea);
            copyBtn.innerHTML = "已复制"
            setTimeout(() => {
                copyBtn.innerHTML = "复制"
            }, 2000);
        }

        highlight.appendChild(copyBtn)
    }
}
addLoadEvent(copyBtnCallback)

function musicPlayer() {
    let music = document.querySelector("#music")
    if (music) {
        let src = music.dataset.src;

        let audio = new Howl({
            src: [src],
            html5: true
        });

        music.onclick = () => {
            audio.playing() ? audio.pause() : audio.play()
        }

        audio.on("load", () => {
            music.setAttribute("style", "cursor: pointer;")
        });

        audio.on("play", setPauseIcon);

        audio.on("pause", setPlayIcon);

        audio.on("end", setPlayIcon);

        function setPlayIcon(params) {
            music.innerText = "▶️"
        }

        function setPauseIcon(params) {
            music.innerText = "⏸"
        }
    }
}
addLoadEvent(musicPlayer)
