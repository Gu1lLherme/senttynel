// Sistema de autenticação FICTÍCIO para testes.
// Não há validação real — qualquer usuário consegue entrar.
// Os dados ficam apenas no localStorage do navegador.

const STORAGE_KEY = 'sentinel_fake_user';

export function getFakeUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setFakeUser({ name, email, role = 'user' }) {
  const user = {
    id: 'demo-' + (email || 'user').toLowerCase().replace(/[^a-z0-9]/g, ''),
    full_name: name || 'Usuário de Teste',
    email: email || 'teste@sentinel.app',
    role,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function clearFakeUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isFakeAuthenticated() {
  return !!getFakeUser();
}