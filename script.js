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

// Display search results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  results.forEach(result => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${result.title}</h3><p>${result.date}</p><ul>${
      result.timestamps.map(ts => `<li>${ts.time} - ${ts.description}</li>`).join('')
    }</ul>`;
    resultsDiv.appendChild(div);
  });
}

// Filter data based on search input
function filterData(data, query) {
  return data.filter(item =>
    item.timestamps.some(ts => ts.description.toLowerCase().includes(query.toLowerCase()))
  );
}

// Event listener for search button click
searchButton.addEventListener('click', async () => {
  const query = searchInput.value;
  try {
    const data = await fetchData();
    const filteredData = filterData(data.flat(), query);
    displayResults(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Initial fetch and display of data
(async () => {
  try {
    const data = await fetchData();
    displayResults(data.flat());
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
})();
