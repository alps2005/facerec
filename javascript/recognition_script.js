const video = document.getElementById('video');
let stream;
let interval;
let canvas;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(() => console.log('Models loaded'));

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
      .then(s => {
        stream = s;
        video.srcObject = stream;
      })
      .catch(err => console.error(err));
}

function stopVideo() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  if (canvas) {
    canvas.remove();
  }
  if (interval) {
    clearInterval(interval);
  }
}

video.addEventListener('play', () => {
  canvas = faceapi.createCanvasFromMedia(video);
  video.parentElement.append(canvas); // Append canvas to the same parent as the video
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  interval = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});