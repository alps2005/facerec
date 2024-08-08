const imageUpload = document.getElementById('imageUpload');
const uploadButton = document.getElementById('uploadButton');
const recElement = document.getElementById('rec');

if (recElement) {
  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  ]).then(start);

  async function start() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    recElement.append(container); 

    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    let image;
    let canvas2;

    recElement.append('Loaded'); 


    uploadButton.addEventListener('click', () => {
      imageUpload.click(); 
    });

    imageUpload.addEventListener('change', async () => {
      if (image) image.remove();
      if (canvas2) canvas2.remove();

      // Create and style the image
      image = await faceapi.bufferToImage(imageUpload.files[0]);
      image.style.width = '800px';  
      image.style.height = 'auto';  

      // Create and style the canvas
      canvas2 = faceapi.createCanvasFromMedia(image);
      canvas2.style.position = 'absolute';
      canvas2.style.display = 'flex';
      canvas2.style.justifyContent = 'center';
      canvas2.style.alignItems = 'center';
      canvas2.style.width = '800px'; 
      canvas2.style.height = 'auto';  
      canvas2.style.objectFit = 'contain';
      canvas2.style.marginTop = '15px';
      canvas2.style.top = '0';
      canvas2.style.left = '0';

      container.append(image);
      container.append(canvas2);  

      // Resize the canvas to match the image dimensions
      const displaySize = { width: image.width, height: image.height };
      faceapi.matchDimensions(canvas2, displaySize);

      // Detect faces and draw boxes
      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
        drawBox.draw(canvas2);
      });
    });
  }

  function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
    return Promise.all(
        labels.map(async label => {
          const descriptions = [];
          for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);
          }
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
  }
}