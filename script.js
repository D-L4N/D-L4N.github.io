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
    const videoID = result.videoID; // Using videoID from the JSON data
    const videoURL = result.link; // Video link from the JSON data

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
        seekVideo(videoID, time); // Pass videoID along with time
      });
    });
  });
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

// Load the YouTube player API asynchronously
function loadYouTubePlayerAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Initialize the YouTube player
function onYouTubeIframeAPIReady() {
  const data = await fetchData();
  const firstVideoID = data[0][0].videoID; // Assuming the first video in the first array is the one to be displayed
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: firstVideoID, // Use the first video ID from the JSON data
    events: {
      'onReady': onPlayerReady
    }
  });
}

// Event listener for when the YouTube player is ready
function onPlayerReady(event) {
  // Player is ready, you can now seek the video to specific times
}

// Function to seek the video to a specific time
function seekVideo(videoID, time) {
  player.loadVideoById(videoID, parseInt(time), 'large'); // Load video by ID and seek to the specified time (in seconds)
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
  // Display search results
function displayResults(results) {
  console.log('Results:', results); //Logging check for debugging
  resultsDiv.innerHTML = '';


})();
