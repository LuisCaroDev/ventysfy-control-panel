export interface User {
  email: string;
  name: string;
}

class AuthStore {
  user = $state<User | null>(null);
}

const storeInstance = new AuthStore();

export function setAuthStore(initialUser: User | null) {
  storeInstance.user = initialUser;
}

export function getAuthStore() {
  return storeInstance;
}
