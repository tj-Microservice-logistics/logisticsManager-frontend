import axiosInstance from './axiosInstance';

// 获取所有用户
export function getAllUsers() {
  return axiosInstance.get('/users');
}

// 根据用户名查询用户
export function getUserByUsername(username: string) {
  return axiosInstance.get(`/users/${username}`);
}

// 创建新用户
export function createUser(user: { username: string; passwordHash: string; role: string }) {
  return axiosInstance.post('/users', user);
}

// 删除用户
export function deleteUser(userId: number) {
  return axiosInstance.delete(`/users/${userId}`);
}
