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
    
    if (detections.length > 0) {
      detections.forEach(detection => {
        const expressions = detection.expressions;
        if (expressions.neutral > 0.5) {
          showNotification('Detectando expresion neutral.')
        }
        if (expressions.sad > 0.5) {
          showNotification('Expresion triste detectada!');
        }
        if (expressions.happy > 0.5) {
          showNotification('Expresion feliz detectada!');
        }
        if (expressions.surprised > 0.5) {
          showNotification('Expresion de sorpresa detectada!');
        }
        if (expressions.angry > 0.5) {
          showNotification('Expresion anojada detectada!');
        }
        if (expressions.disgusted > 0.5) {
          showNotification('Expresion de disgusto detectada!');
        }
        if (expressions.fearful > 0.5) {
          showNotification('Expresion de miedo detectada!');
        }
      });
    }
  }, 100);
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'absolute';
  notification.style.bottom = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Remove notification after 3 seconds
}