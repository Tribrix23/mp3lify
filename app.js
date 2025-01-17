document.addEventListener('DOMContentLoaded', () => {
    const songNameInput = document.getElementById('songName');
    const searchBtn = document.getElementById('searchBtn');
    const songDetails = document.getElementById('songDetails');
    const songTitle = document.getElementById('songTitle');
    const songThumbnail = document.getElementById('songThumbnail');
    const songDuration = document.getElementById('songDuration');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const additionalResults = document.getElementById('additionalResults');

    // Handle search functionality
    searchBtn.addEventListener('click', async () => {
        const songName = songNameInput.value.trim();
        if (songName === '') return;

        try {
            // New API: Search for song by name
            const url = `https://yt-api.p.rapidapi.com/search?query=${encodeURIComponent(songName)}`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': 'bb2807eca9msh99231bd42dedf78p15b8bcjsn97693d97cb1c', // Replace with your RapidAPI key
                    'x-rapidapi-host': 'yt-api.p.rapidapi.com'
                }
            };

            const response = await fetch(url, options);
            const result = await response.json();

            if (!result.data || result.data.length === 0) {
                alert('No results found. Please try another song.');
                return;
            }

            // Display the main result (first item)
            const mainResult = result.data[0];
            const videoId = mainResult.videoId;
            const thumbnailUrl = mainResult.thumbnail?.[0]?.url || mainResult.richThumbnail?.[0]?.url || 'default-thumbnail.jpg';
            const name = mainResult.title;
            const duration = mainResult.lengthText;

            if (!videoId) {
                alert('No videoId found for the main result.');
                return;
            }

            // Populate the main result
            songThumbnail.src = thumbnailUrl;
            songTitle.textContent = name;
            songDuration.textContent = `Duration: ${duration}`;
            songDetails.classList.remove('hidden');
            songDetails.classList.add('scale-100'); // Animation to scale up

            // Set download functionality for the main result
            downloadBtn.onclick = () => fetchMp3DownloadLink(videoId);

            // Display more results
            resultsContainer.classList.remove('hidden');
            additionalResults.innerHTML = '';
            result.data.slice(1).forEach((video) => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result flex items-center bg-gray-700 rounded-lg p-6 shadow-lg transform hover:scale-105 transition duration-300';

                const img = document.createElement('img');
                const videoThumbnailUrl = video.thumbnail?.[0]?.url || video.richThumbnail?.[0]?.url || 'default-thumbnail.jpg';
                img.src = videoThumbnailUrl;
                img.alt = 'Thumbnail';
                img.className = 'w-24 h-24 rounded-xl shadow-lg';

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'ml-4 flex flex-col flex-1';

                const name = document.createElement('h4');
                name.textContent = video.title;
                name.className = 'text-lg font-bold text-white';

                const downloadButton = document.createElement('button');
                downloadButton.textContent = '⬇ Download';
                downloadButton.className = 'mt-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-green-500 text-white font-semibold rounded-lg px-4 py-2 transition transform hover:scale-105 shadow-lg';

                // Ensure that videoId exists before attaching download link
                if (video.videoId) {
                    downloadButton.onclick = () => fetchMp3DownloadLink(video.videoId);
                } else {
                    console.error('No videoId found for additional result:', video);
                }

                detailsDiv.appendChild(name);
                detailsDiv.appendChild(downloadButton);

                resultDiv.appendChild(img);
                resultDiv.appendChild(detailsDiv);
                additionalResults.appendChild(resultDiv);

                // On clicking any song in the more results, update the main song
                resultDiv.addEventListener('click', () => {
                    songThumbnail.src = videoThumbnailUrl;
                    songTitle.textContent = video.title;
                    songDuration.textContent = `Duration: ${video.lengthText}`;
                    fetchMp3DownloadLink(video.videoId);
                });
            });
        } catch (error) {
            console.error('Error fetching data from the search API:', error);
            alert('Error fetching song details. Please try again.');
        }
    });

    // Fetch MP3 download link
    async function fetchMp3DownloadLink(videoId) {
        if (!videoId) {
            console.error('No videoId provided for download');
            return;
        }

        const mp3ApiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
        const mp3ApiOptions = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'bb2807eca9msh99231bd42dedf78p15b8bcjsn97693d97cb1c', // Replace with your RapidAPI key
                'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
            }
        };

        try {
            const mp3Response = await fetch(mp3ApiUrl, mp3ApiOptions);
            const mp3Data = await mp3Response.json();

            if (mp3Data.status === 'ok') {
                const mp3Link = mp3Data.link;
                const link = document.createElement('a');
                link.href = mp3Link;
                link.download = `${videoId}.mp3`;
                link.click();
            } else {
                alert('Error fetching MP3 download link. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching MP3 link:', error);
            alert('Error fetching MP3 download link. Please try again.');
        }
    }
});
