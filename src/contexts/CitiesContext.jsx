import {
  useEffect,
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();
// eslint-disable-next-line react/prop-types
function CitiesProvider({ children }) {
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});
  const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: {},
  };
  function reducer(state, action) {
    switch (action.type) {
      case "loading":
        return { ...state, isLoading: true };
      case "city/loaded":
        return { ...state, currentCity: action.payload, isLoading: false };
      case "cities/loaded":
        return { ...state, isLoading: false, cities: action.payload };
      case "city/created":
        return {
          ...state,
          cities: [...state.cities, action.payload],
          isLoading: false,
          currentCity: action.payload,
        };

      case "city/deleted":
        return {
          ...state,
          cities: state.cities.filter((city) => city.id !== action.payload),
          isLoading: false,
        };
      case "rejected":
        return { ...state, isLoading: false, error: action.payload };
      default:
        throw new Error("Unknown action type");
    }
  }
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const BASE_URL = "http://localhost:8000";
  useEffect(function () {
    let controller = new AbortController();
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        console.log(err);
        dispatch({ type: "rejected", payload: err });
      }
      return () => controller?.abort();
    }
    fetchCities();
  }, []);
  const getCity = useCallback(
    async function getCity(id) {
      if (id === currentCity.id) return;
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch (err) {
        dispatch({ type: "rejected", payload: err });
      }
    },
    [currentCity.id]
  );
  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch (err) {
      dispatch({ type: "rejected", payload: err });
    }
  }
  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({ type: "reject", payload: err });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}
function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside of CitiesProvider");
  return context;
}

export { CitiesContext, CitiesProvider, useCities };
