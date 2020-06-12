(function() {
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimaitonFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var canvas = document.getElementById("sig-canvas");
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 4;

    var drawing = false;
    var mousePos = {
        x: 0,
        y: 0
    };
    var lastPos = mousePos;

    canvas.addEventListener("mousedown", function(e) {
        drawing = true;
        lastPos = getMousePos(canvas, e);
    }, false);

    canvas.addEventListener("mouseup", function(e) {
        drawing = false;
    }, false);

    canvas.addEventListener("mousemove", function(e) {
        mousePos = getMousePos(canvas, e);
    }, false);

    // Add touch event support for mobile
    canvas.addEventListener("touchstart", function(e) {

    }, false);

    canvas.addEventListener("touchmove", function(e) {
        var touch = e.touches[0];
        var me = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(me);
    }, false);

    canvas.addEventListener("touchstart", function(e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var me = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(me);
    }, false);

    canvas.addEventListener("touchend", function(e) {
        var me = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(me);
    }, false);

    function getMousePos(canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        }
    }

    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        }
    }

    function renderCanvas() {
        if (drawing) {
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#c0392b';
            ctx.stroke();
            lastPos = mousePos;
        }
    }

    // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);

    (function drawLoop() {
        requestAnimFrame(drawLoop);
        renderCanvas();
    })();

    function clearCanvas() {
        canvas.width = canvas.width;
    }

    // Set up the UI
    var sigText = document.getElementById("sig-dataUrl");
    var sigImage = document.getElementById("sig-image");
    var clearBtn = document.getElementById("sig-clearBtn");
    var submitBtn = document.getElementById("sig-submitBtn");
    clearBtn.addEventListener("click", function(e) {
        clearCanvas();
        sigText.innerHTML = "Data URL for your signature will go here!";
        sigImage.setAttribute("src", "");
    }, false);
    submitBtn.addEventListener("click", function(e) {
        var dataUrl = canvas.toDataURL();
        sigText.innerHTML = dataUrl;
        sigImage.setAttribute("src", dataUrl);
    }, false);

    //pdf upload and display
    const PDF_TYPE = "application/pdf";
    const TXT_TYPE = "text/plain";

    document.getElementById('files').addEventListener('change', handleFileSelect, false);


    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            let fileType = files[i].type;
            if (fileType === PDF_TYPE) {
                handlePDFFile(files[i]);
            } else if (fileType === TXT_TYPE) {
                handleTxtFile(files[i])
            } else {
                console.error(`cannot handle file type: ${fileType}`)
            }
        }
    }

    function handleTxtFile(file) {
        var reader = new FileReader();
        reader.onload = (function(reader) {
            return function() {
                var contents = reader.result;
                var lines = contents.split('\n');

                document.getElementById('container').innerHTML = contents;
            }
        })(reader);

        reader.readAsText(file);
    }

    function handlePDFFile(file) {
        var reader = new FileReader();

        reader.onload = (function(reader) {
            return function() {
                var contents = reader.result;
                var loadingTask = pdfjsLib.getDocument(contents);

                loadingTask.promise.then(function(pdf) {
                    pdf.getPage(1).then(function(page) {
                        var scale = 1.5;
                        var viewport = page.getViewport({
                            scale: scale,
                        });

                        var canvas = document.getElementById('the-canvas');
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext);
                    });
                });
            }
        })(reader);
        reader.readAsDataURL(file);
    }
})();