import request from '@/utils/request';

export async function view(c) {
  return await request(`/api/${c}/view`);
}
export async function find(c, params) {
  return await request(`/api/${c}/find`, {
    method: 'post',
    data: params
  });
}

export async function Remove(c, params) {
  return await request(`/api/${c}`, {
    method: 'delete',
    data: params
  });
}

export async function Create(c, params) {
  return await request(`/api/${c}`, {
    method: 'post',
    data: params
  });
}

export async function Update(c, id, params) {
  return await request(`/api/${c}/${id}`, {
    method: 'put',
    data: params
  });
}
export async function Execute(c, command, params) {
  return await request(`/api/${c}/${command}`, {
    method: 'post',
    data: params
  });
}
