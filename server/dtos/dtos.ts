export default class UserDtos {
  id: number;
  email: string;
  isActivated: boolean;
  role: string

  constructor(model: { id: number; email: string; isActivated: boolean; role: string; } ) {
    this.id = model.id;
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.role = model.role;
  }
}
