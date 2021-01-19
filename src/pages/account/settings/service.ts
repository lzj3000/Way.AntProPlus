import request from '@/utils/request';

export async function queryCurrent() {
  return request('/api/user/info');
}
export async function setpassword(payload: any) {
  return request('/api/user/changepassword',
    {
      method: 'POST',
      data: { oldpassword: payload.oldpassword, newpassword: payload.newpassword }
    }
  );
}
export async function queryProvince() {
  return request('/api/geographic/province');
}

export async function queryCity(province: string) {
  return request(`/api/geographic/city/${province}`);
}

export async function query() {
  return request('/api/users');
}
