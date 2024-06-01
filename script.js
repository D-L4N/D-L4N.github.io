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

// Display search results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  results.forEach(result => {
    const videoURL = result.link; // Video link from the JSON data
    const videoID = getYouTubeVideoID(videoURL); // Extract video ID from the URL

    const div = document.createElement('div');
    div.classList.add('result-item');
    
    div.innerHTML = `
      <div class="result-content">
        <h3>
          <a href="${videoURL}" target="_blank" class="stream-link">${result.title}</a>
          <button class="collapse-button">Show</button>
        </h3>
        <p>${result.date}</p>
        <ul class="timestamps">
          ${result.timestamps.map(ts => `<li><a href="#" class="timestamp-link" data-time="${ts.time}">${ts.time}</a> - ${ts.description}</li>`).join('')}
        </ul>
        <div class="video-container">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `;
    resultsDiv.appendChild(div);

    const collapseButton = div.querySelector('.collapse-button');
    const timestamps = div.querySelector('.timestamps');
    
    collapseButton.addEventListener('click', () => {
      if (timestamps.style.display === 'none') {
        timestamps.style.display = 'block';
        timestamps.classList.add('fade-in');
        collapseButton.textContent = 'Hide';
      } else {
        timestamps.style.display = 'none';
        timestamps.classList.remove('fade-in');
        collapseButton.textContent = 'Show';
      }
    });

    // Add event listener for timestamp links
    const timestampLinks = div.querySelectorAll('.timestamp-link');
    timestampLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const time = link.dataset.time;
        scrollToTime(time); // Scroll to the specified time
      });
    });
  });
}

// Function to extract video ID from YouTube video URL
function getYouTubeVideoID(url) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  const videoID = match ? match[1] : null;
  return videoID;
}

// Filter data based on search input
function filterData(data, query) {
  return data.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.timestamps.some(ts => ts.description.toLowerCase().includes(query.toLowerCase()))
  );
}

// Event listener for search button click
searchButton.addEventListener('click', async () => {
  const query = searchInput.value;
  try {
    const data = await fetchData();
    const filteredData = query ? filterData(data.flat(), query) : data.flat();
    displayResults(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Function to load the YouTube Player API
function loadYouTubePlayerAPI() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Initialize the YouTube player when the Iframe API is ready
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: videoID, // Replace with your video ID
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// Function to handle state changes of the YouTube player
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING && ytSeconds > 0) {
    player.seekTo(ytSeconds);
    ytSeconds = 0;
  }
}

// Function to seek to a specific time in the video
function seekTo(seconds) {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.seekTo(seconds);
  } else {
    ytSeconds = seconds;
    player.playVideo();
  }
}

// Add event listener for timestamp links
const timestampLinks = div.querySelectorAll('.timestamp-link');
timestampLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    const time = link.dataset.time;
    const [minutes, seconds] = time.split(':').map(parseFloat);
    const totalSeconds = minutes * 60 + seconds;
    seekTo(totalSeconds); // Call seekTo function with the specified time
  });
});

// Initial fetch and display of data
(async () => {
  try {
    const data = await fetchData();
    displayResults(data.flat().sort((a, b) => new Date(a.date) - new Date(b.date)));
    loadYouTubePlayerAPI(); // Load the YouTube player API
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
})();
