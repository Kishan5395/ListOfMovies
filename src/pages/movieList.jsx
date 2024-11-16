import React, { useState, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchMovieDetail, fetchMovies } from '../services/movieService';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [movieDetails, setMovieDetails] = useState({});
  const [movieDetailsLoading, setMovieDetailsLoading] = useState({});
  const debounceTimer = useRef(null);

  const loadMovies = async () => {
    if (loading || searchTerm.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await fetchMovies(searchTerm, page);
      if (error) {
        setError(error);
      } else {
        if (data.data.Response === "True") {
          setMovies(prevMovies => [...prevMovies, ...data.data.Search]);
          setHasMore(data.data.Search.length < data.data.totalResults);
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 3) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
        loadMovies();
      }, 500);
    } else {
      setMovies([]);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAccordionChange = async (panel, imdbID, title, year) => {
    if (expanded === panel) {
      setExpanded(null);
    } else {
      setExpanded(panel);
      setMovieDetailsLoading(prevState => ({ ...prevState, [imdbID]: true }));

      try {
        const details = await fetchMovieDetail(title, year, imdbID);
        setMovieDetails(prevDetails => ({
          ...prevDetails,
          [imdbID]: details.data.data,
        }));
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setMovieDetailsLoading(prevState => ({ ...prevState, [imdbID]: false }));
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ margin: searchTerm.length > 0 ? '25px' : "25% 20px" }}>
        <h1 style={{ margin: "20px" }}>Movie List</h1>
        <TextField
          label="Search for a movie"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "50%" }}
          InputProps={{ disabled: loading }}
        />
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {loading && movies.length === 0 && (
        <div style={{ textAlign: 'center', margin: '50px 0' }}><CircularProgress /></div>
      )}
      {!loading && searchTerm.length > 0 && (
        <h2>Search Result</h2>
      )}
      {searchTerm.length > 0 && movies.length > 0 && (
        <InfiniteScroll
          dataLength={movies.length}
          next={loadMovies}
          hasMore={hasMore}
          loader={<div style={{ textAlign: 'center', margin: '20px 0' }}><CircularProgress /></div>}
          endMessage={<div style={{ textAlign: 'center', margin: '20px 0', color: 'gray' }}>No more movies to display.</div>}
        >
          {movies.map((movie) => (
            <Accordion
              key={movie.imdbID}
              expanded={expanded === movie.imdbID}
              onChange={() => handleAccordionChange(movie.imdbID, movie.imdbID, movie.Title, movie.Year)}
              sx={{ marginBottom: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{movie.Title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {movieDetailsLoading[movie.imdbID] ? (
                  <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                  </div>
                ) : (
                  expanded === movie.imdbID && movieDetails[movie.imdbID] && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: "space-around" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "50%" }}>
                        <Typography variant="body2"><strong>Year:</strong> {movie.Year}</Typography>
                        <Typography variant="body2"><strong>Genre:</strong> {movieDetails[movie.imdbID].Genre}</Typography>
                        <Typography variant="body2"><strong>Director:</strong> {movieDetails[movie.imdbID].Director}</Typography>
                        <Typography variant="body2"><strong>IMDB Id:</strong> {movie.imdbID}</Typography>
                        <Typography variant="body2"><strong>Actors:</strong> {movieDetails[movie.imdbID].Actors}</Typography>
                        <Typography variant="body2"><strong>Awards:</strong> {movieDetails[movie.imdbID].Awards}</Typography>
                        {movieDetails[movie.imdbID].Plot !== "N/A" && <Typography>{movieDetails[movie.imdbID].Plot}</Typography>}
                      </div>
                      {movie.Poster && movie.Poster !== 'N/A' && (
                        <div style={{ marginTop: '20px', flexShrink: 0 }}>
                          <img
                            src={movie.Poster}
                            alt={movie.Title}
                            style={{ maxWidth: '120px', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </InfiniteScroll>
      )}
      {searchTerm.length > 0 && movies.length === 0 && !loading && (
        <div>
          <h4>No Movies Found!...</h4>
          <h5>Please check the search value</h5>
        </div>
      )}
    </div>
  );
};

export default MovieList;
