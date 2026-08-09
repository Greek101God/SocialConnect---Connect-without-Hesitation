import axios from 'axios';


export const BASE_URL= "https://socialconnect-connect-without-hesitation.onrender.com"

export const clientServer = axios.create({
  baseURL: BASE_URL,
})