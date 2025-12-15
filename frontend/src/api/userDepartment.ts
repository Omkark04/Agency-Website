// API function to get user's department (where user is team_head)
import api from './api';

export const getUserDepartment = async () => {
  const response = await api.get('/user/department/');
  return response.data;
};
