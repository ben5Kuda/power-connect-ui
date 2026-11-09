import { Platform } from 'react-native';

// Where the Java API is running.
//  - EXPO_PUBLIC_API_URL is set when building for Docker/the server (the website uses "/api").
//  - Otherwise, in the web browser on this computer, "localhost" works.
//  - On a phone (Expo Go), use this computer's Wi-Fi IP address (run `hostname -I` to find it).
const API_URL = process.env.EXPO_PUBLIC_API_URL
  || (Platform.OS === 'web' ? 'http://localhost:8089' : 'http://192.168.101.104:8089');

// The token we get when logging in. It is sent with every request so the API knows who we are.
let token = null;

export function setToken(newToken) {
  token = newToken;
}

// Send a request to the API and return the JSON reply.
// If the API replies with an error, throw it so the screen can show the message.
async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Token = token;
  }

  const response = await fetch(API_URL + path, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data && data.message ? data.message : 'Something went wrong');
  }
  return data;
}

export function get(path) {
  return request('GET', path);
}

export function post(path, body) {
  return request('POST', path, body);
}

export function put(path, body) {
  return request('PUT', path, body);
}

export function del(path) {
  return request('DELETE', path);
}

// The API sends times like "2026-11-06T21:48:28". Show them as "2026-11-06 21:48".
export function formatTime(time) {
  if (!time) return '';
  return time.replace('T', ' ').substring(0, 16);
}
