import axios from 'axios';

const apiKey = process.env.REACT_APP_API_KEY;

export const fetchMovies = async (searchTerm, page) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com`, {
      params: {
        s: searchTerm,
        page: page,
        apikey: apiKey,
        type: "movie",
      },
    });
    console.log(response);
    return { data: response, error: false };
  } catch (e) {
    console.log(e);
    return { data: e.response, error: true };
  }
}
export const fetchMovieDetail = async (searchTerm, year) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com`, {
      params: {
        t: searchTerm,
        apikey: apiKey,
        year: year
      },
    });
    console.log(response);
    return { data: response, error: false };
  } catch (e) {
    console.log(e);
    return { data: e.response, error: true };
  }
}




