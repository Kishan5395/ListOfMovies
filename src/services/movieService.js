import axios from 'axios';

export const fetchMovies = async (searchTerm, page) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com`, {
      params: {
        s: searchTerm,
        page: page,
        apikey: "cc83fbfe",
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
        apikey: "cc83fbfe",
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




