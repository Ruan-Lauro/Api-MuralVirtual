import { IAuthService } from "../interfaces/authInterface";
import { HttpResponse } from "../interfaces/interfaces";
import { IUserRepository } from "../interfaces/userInterface";
import { User } from "../models/User";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const compareHash = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compareSync(password, hash)
}

export const generateToken = (id: string): string => {
  const SECRET = process.env.JWT_SECRET_KEY || "SECRET";
  const token = jwt.sign({
    id: id,
  }, SECRET, { expiresIn: "1h" });

  return token;
}


export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(email: string, password: string):
   Promise<HttpResponse<Omit<User, "password">>> {
    try {
    
      const user = await this.userRepository.getUserByEmail(email);

      if(!user) return {
        statusCode: 400,
        body: "User not registered."
      }

      const current = user;
      const matchPassword = await compareHash(password, current!.password);
      if(!matchPassword) return {
        statusCode: 400,
        body: "Incorrect password."
      }

      const { password: currentPass, ...currentWithoutPassword } = current!;
      currentPass;
      const token = generateToken(user.id)
     
      return {
        statusCode: 200,
        body: currentWithoutPassword,
        cookies: token
      }
      
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`
      }
    }
  }
}