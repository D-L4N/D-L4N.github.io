const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');

// Load JSON data
async function fetchData() {
  // Fetch the manifest file to get the list of JSON files
  const manifestResponse = await fetch('streams/manifest.json');
  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch manifest: ' + manifestResponse.statusText);
  }
  const manifest = await manifestResponse.json();

  // Fetch all JSON files listed in the manifest
  const dataPromises = manifest.map(file => fetch(`streams/${file}`).then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch ' + file + ': ' + response.statusText);
    }
    return response.json();
  }));
  
  // Wait for all fetch promises to resolve
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
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.timestamps.some(ts => ts.description.toLowerCase().includes(query.toLowerCase()))
  );
}

// Event listener for search input
searchInput.addEventListener('input', async () => {
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

