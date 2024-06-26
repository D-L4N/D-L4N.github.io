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

// Display search results
function displayResults(results, query) {
    resultsDiv.innerHTML = '';
    results.forEach(result => {
        const videoURL = result.link; // Video link from the JSON data
        const videoID = getYouTubeVideoID(videoURL); // Extract video ID from the URL

        const div = document.createElement('div');
        div.classList.add('result-item');

        // Highlight function to add highlighting to searched terms
        function highlight(text) {
            if (query && query.trim() !== '') {
                return text.replace(new RegExp(`(${query})`, 'gi'), '<span class="highlight">$1</span>');
            } else {
                return text;
            }
        }

        div.innerHTML = `
            <div class="result-content">
                <h3>
                    <a href="${videoURL}" target="_blank" class="stream-link">${highlight(result.title)}</a>
                    <button class="collapse-button">Show</button>
                </h3>
                <p>${highlight(result.date)}</p>
                <ul class="timestamps">
                    ${result.timestamps.map(ts => {
                        const [minutes, seconds] = ts.time.split(':').map(parseFloat);
                        const totalSeconds = minutes * 60 + seconds;
                        return `<li><a href="${videoURL}&t=${totalSeconds}" target="_blank" class="timestamp-link" data-time="${ts.time}">${ts.time}</a> - ${highlight(ts.description)}</li>`;
                    }).join('')}
                </ul>
                <div class="video-container">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>`;

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

        // Add event listener for timestamp links INSIDE THE LOOP
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
  const query = searchInput.value.trim(); // Trim the query to remove leading and trailing whitespaces
  try {
    const data = await fetchData();
    if (query) { // If the query is not empty
      const filteredData = filterData(data.flat(), query);
      displayResults(filteredData, query);
    } else { // If the query is empty
      displayResults(data.flat());
    }
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
  player.playVideo();
  player.seekTo(seconds, true);
}

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
