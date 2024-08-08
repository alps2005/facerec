function showPage(pageId) {
    // Hide all content
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => content.classList.remove('active'));

    // Show the selected content
    const selectedContent = document.getElementById(pageId);
    selectedContent.classList.add('active');

    // Start or stop video based on pageId
    if (pageId === 'emo') {
        startVideo();
    } else {
        stopVideo();
    }
}