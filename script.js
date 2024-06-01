// Define constants and variables
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
let player; // Variable to store the YouTube player instance

// Load JSON data
async function fetchData() {
  const manifestResponse = await fetch('streams/manifest.json');
  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch manifest: ' + manifestResponse.statusText);
  }
  const manifest = await manifestResponse.json();
  const dataPromises = manifest.map(file => fetch(`streams/${file}`).then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch ' + file + ': ' + response.statusText);
    }
    return response.json();
  }));

  const data = await Promise.all(dataPromises);
  return data;
}

// Function to scroll to a specific time in the video
function scrollToTime(time) {
  // Assuming you have a video player element with an ID 'player'
  const playerElement = document.getElementById('player');
  // Assuming you want to scroll to the video player element
  playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to seek to a specific time in the video
function seekTo(seconds) {
  player.seekTo(seconds, true); // Set allowSeekAhead to true to allow seeking outside of buffered data
}

// Display search results
function displayResults(results) {
    resultsDiv.innerHTML = '';
    results.forEach(result => {
      const videoURL = result.link; // Video link from the JSON data
      const videoID = getYouTubeVideoID(videoURL); // E
