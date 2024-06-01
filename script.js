const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');

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

// Extract video ID from YouTube link
function getYouTubeVideoID(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v");
}

// Display search results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  results.forEach(result => {
    const videoID = getYouTubeVideoID(result.link);
    const thumbnailURL = `https://img.youtube.com/vi/${videoID}/0.jpg`;
    const div = document.createElement('div');
    div.classList.add('result-item');
    
    div.innerHTML = `
      <div class="result-content">
        <h3>
          <a href="${result.link}" target="_blank" class="stream-link">${result.title}</a>
          <button class="collapse-button">Show</button>
        </h3>
        <p>${result.date}</p>
        <ul class="timestamps" style="display: none;">
          ${result.timestamps.map(ts => `<li>${ts.time} - ${ts.description}</li>`).join('')}
        </ul>
      </div>
      <img src="${thumbnailURL}" alt="${result.title} Thumbnail" class="thumbnail">
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

// Initial fetch and display of data
(async () => {
  try {
    const data = await fetchData();
    displayResults(data.flat().sort((a, b) => new Date(a.date) - new Date(b.date)));
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
})();
