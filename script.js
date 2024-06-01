const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');

// Load JSON data
async function fetchData() {
  const manifestResponse = await fetch('streams/manifest.json');
  console.log('Fetching manifest.json...');
  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch manifest: ' + manifestResponse.statusText);
  }
  const manifest = await manifestResponse.json();
  console.log('Manifest fetched:', manifest);

  const dataPromises = manifest.map(file => {
    console.log('Fetching', file);
    return fetch(`streams/${file}`).then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch ' + file + ': ' + response.statusText);
      }
      return response.json();
    });
  });

  const data = await Promise.all(dataPromises);
  console.log('Data fetched:', data);
  return data;
}

// Display search results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  results.forEach(result => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3><a href="${result.link}" target="_blank" class="stream-link">${result.title}</a></h3>
      <p>${result.date}</p>
      <ul>${result.timestamps.map(ts => `<li>${ts.time} - ${ts.description}</li>`).join('')}</ul>
    `;
    resultsDiv.appendChild(div);
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
