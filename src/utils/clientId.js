export function getClientId(){
  const key = 'client_id'
  let id = localStorage.getItem(key)
  if(!id){
    id = Math.random().toString(36).slice(2)+Date.now().toString(36)
    localStorage.setItem(key,id)
  }
  return id
}
