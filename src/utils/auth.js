import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post(`user/token/`, {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response.data?.detail || "Something went wrong",
    };
  }
};

export const register = async (username ,full_name, email, password, password2) => {
  try {
    const { data } = await axios.post(`user/register/`, {
      username,
      full_name,
      email,
      password,
      password2,
    });

    await login(email, password);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        `${error.response.data.full_name} - ${error.response.data.email}` ||
        "Something went wrong",
    };
  }
};


/// function for saving the tokens in the client side 
export const setAuthUser = (access_token, refresh_token) => {
  Cookie.set("access_token", access_token, {
    expires: 1,
    secure: true,
  });

  Cookie.set("refresh_token", refresh_token, {
    expires: 7,
    secure: true,
  });

  const user = jwt_decode(access_token) ?? null;  /// cheaks if  token is valid is so returns the payload 

  if (user) { // if its valid 
    useAuthStore.getState().setUser(user); 
  }
  useAuthStore.getState().setLoading(false);
};


export const setUser = async () => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    alert("Tokens does not exists");
    return;
  }

  if (isAccessTokenExpired(access_token)) {
    const response = getRefreshedToken(refresh_token);
    if(response)
       setAuthUser(response.access, response.refresh);
  } else {
    setAuthUser(access_token, refresh_token);  /////////////// BAD CARDINALS - DONT RETURN ANYTHING 
  }
};



export const getRefreshedToken = async (refresh_token) => {
  
  const response = await axios.post(`user/token/refresh/`, {    /// the backend logic does not returns a new access and refresh token
    refresh: refresh_token,
  });
  if( response.status === 200 ) 
        return response.data;  // returns new access token and new refresh token or null? when the refresh token is not ok. 
  else{
    console.error('Unexpected response status:', response.status);
    return null;
  }
};

export const isAccessTokenExpired = (access_token) => {
  try {
    const decodedToken = jwt_decode(access_token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    console.log(error);
    return true;
  }
};

export const logout = () => {
  Cookie.remove("access_token");
  Cookie.remove("refresh_token");
  useAuthStore.getState().setUser(null);
};