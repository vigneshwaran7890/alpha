import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchUsers = async () => {
  const res = await axios.get(`${API_BASE_URL}/people`);
  return res.data;
};

export const fetchSnippetWithLogs = async (snippetId: string) => {
  const res = await axios.get(`${API_BASE_URL}/snippet-with-logs/${snippetId}`);
  return res.data;
};

export const enrichUser = async (userId: string) => {
  const res = await axios.post(`${API_BASE_URL}/enrich/${userId}`);
  return res.data;
};

export const fetchAllSnippetsWithLogs = async () => {
  const res = await axios.get(`${API_BASE_URL}/all-snippets-with-logs`);
  return res.data;
};
