interface User {
  username: string;
  password: string;
  refreshToken?: string;
  roles: Roles;
}

interface UserDB {
  users: User[];
  setUsers: (data: User[]) => void;
}

type Roles = {
  User?: number;
  Editor?: number;
  Admin?: number;
  // [key: string]: number | undefined; // allow for additional roles
};

export { User, UserDB, Roles };
