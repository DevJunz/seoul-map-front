// 개발(Vite proxy)·배포(Netlify redirect) 모두 /api를 백엔드로 프록시 —
// 같은 오리진이어야 백엔드가 발급하는 client_id 쿠키가 저장/전송됨(좋아요 중복 방지용)
const BASE = '/api'

async function request(path, opts={}){
  const url = BASE + path
  const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts })
  const body = await res.json().catch(()=>null)
  if(!res.ok) {
    const err = new Error(body?.message || res.statusText || 'Request failed')
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export async function getPosts(page=1, take=20){
  const r = await request(`/posts?page=${page}&take=${take}`)
  return r.data
}

export async function createPost({ title, content, pwd }){
  const r = await request('/posts', { method: 'POST', body: JSON.stringify({ title, content, pwd }) })
  return r.data
}

export async function patchPost(id, { title, content, pwd }){
  const r = await request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ title, content, pwd }) })
  return r.data
}

export async function postLike(id){
  const r = await request(`/posts/${id}/likes`, { method: 'POST' })
  return r.data
}

export async function deleteLike(id){
  const r = await request(`/posts/${id}/likes`, { method: 'DELETE' })
  return r.data
}

export async function deletePost(id, pwd){
  // try DELETE first, fallback to PATCH with empty
  try{
    const r = await request(`/posts/${id}`, { method: 'DELETE', body: pwd ? JSON.stringify({ pwd }) : undefined })
    return r.data
  }catch(err){
    // fallback: server may not support delete
    throw err
  }
}

export async function getPlaces(){
  const r = await request('/places')
  return r.data
}

export async function getCalendars(year, month){
  const r = await request(`/calendars?year=${year}&month=${String(month).padStart(2,'0')}`)
  return r.data
}

export default { request, getPosts, createPost, patchPost, postLike, deleteLike, getPlaces, getCalendars }
