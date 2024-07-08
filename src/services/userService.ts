import { User } from "../models/User";

// Authentication
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"

// Interfaces
import { HttpResponse } from "../interfaces/interfaces";
import { IUserRepository, IUserService } from "../interfaces/userInterface";
import { error } from "console";
import { text } from "body-parser";

export const hashPass = async (password: string): Promise<string> => {
  const salt = process.env.BCRYPT_SALT || "10";
  const saltValue = await bcrypt.genSaltSync(parseInt(salt));
  const hash = await bcrypt.hashSync(password, saltValue);
  return hash;
};

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async getAllUsers(): Promise<HttpResponse<User[]>> {
    try {
      const users = await this.userRepository.getAllUsers();

      if (!users)
        return {
          statusCode: 400,
          body: "No users found.",
        };

      return {
        statusCode: 200,
        body: users,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async getUserById(
    id: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const user = await this.userRepository.getUserById(id);
      if (!user)
        return {
          statusCode: 404,
          body: "User not found.",
        };

      const { password, ...userWithoutPass } = user;
      password;

      return {
        statusCode: 200,
        body: userWithoutPass,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async Feedback(
    email: string, text: string, name: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const transponder = nodemailer.createTransport({
        service:'gmail',
        auth:{
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      })
    

      const emailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject:`E-mail de ${name}`,
        text:`${name} com seu e-mail: ${email} mandou: ${text}`
      }

      transponder.sendMail(emailOptions, (error, info)=>{
        if(error){
          return {
            statusCode: 500,
            body: "Erro no envio do email.",
          }
        }
      })

      return {
        statusCode: 201,
        body: "E-mail enviado.",
      };

    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async emailEnv(
    email: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const transponder = nodemailer.createTransport({
        service:'gmail',
        auth:{
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      })

      function generateRandomString(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
      }

      let cod = generateRandomString()

      const emailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject:"Código de confirmação",
        // body of the email
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Mural Virtual</title>
    <style>
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #1e1e1e;
                color: #ffffff;
            }
            .dark-logo {
                display: block;
            }
            .light-logo {
                display: none;
            }
            
            
        }
        @media (prefers-color-scheme: light) {
            body {
                background-color: #ffffff;
                color: #000000;
            }
            .dark-logo {
                display: none;
            }
            .light-logo {
                display: block;
            }
            

        }
    </style>
</head>
<body style="background-color: #ffffff; color: #000000; margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <img class="dark-logo" src="https://res.cloudinary.com/dfmdiobwa/image/upload/v1717536161/aidyhvrb83pni3vx5odp.png" alt="logo do Mural" width="60" style=" margin-bottom: 20px;">
                <h1 style="font-size: 22px; margin-bottom: 10px; color: #333333;">Código de verificação</h1>
                <h2 style="font-size: 18px; font-weight: normal; margin-bottom: 20px; color: #666666;">Use este código para verificar seu e-mail</h2>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #333333;">O código é: ${cod}</p>
                <img src="https://res.cloudinary.com/dfmdiobwa/image/upload/v1717536127/qkgblhekmyxd2gz2bo76.png" class="dark-logo" alt="personMural" width="160"  style="margin-bottom: 20px;">
                
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px 0;">
               
                <img class="dark-logo" src="https://res.cloudinary.com/dfmdiobwa/image/upload/v1717536143/zlrzdi3rc94h4httzuqj.png" alt="Logotipo do Mural" width="240" style="margin-bottom: 20px;">
            </td>
        </tr>
    </table>
</body>
</html>
`
      }

      transponder.sendMail(emailOptions, (error, info)=>{
        if(error){
          return {
            statusCode: 500,
            body: "Erro no envio do email.",
          }
        }
      })

      return {
        statusCode: 201,
        body: cod,
      };

    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async addUser(
    data: User
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExistsEmail = await this.userRepository.getUserByEmail(data.email);
      const userExistsUsername = await this.userRepository.getUserByUsername(data.username);
      if (userExistsEmail || userExistsUsername)
        return {
          statusCode: 400,
          body: "User already exists.",
        };

      // Hash password
      //New
      data.password = await hashPass(data.password);
      data.username = data.username.toLowerCase();

      await this.userRepository.addUser(data);

      return {
        statusCode: 201,
        body: "User created successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async updateUser(
    id: string,
    dataUser: User
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExists = await this.userRepository.getUserById(id);
      if (!userExists)
        return {
          statusCode: 404,
          body: "User not found.",
        };

        if (dataUser.email || dataUser.username) {
              
          const userExistsEmail = dataUser.email 
            ? await this.userRepository.getUserByEmail(dataUser.email)
            : null;
          const userExistsUsername = dataUser.username 
            ? await this.userRepository.getUserByUsername(dataUser.username)
            : null;
    
          if (userExistsEmail && userExistsEmail.id !== id) {
            return {
              statusCode: 400,
              body: "Email already in use.",
            };
          }
    
          if (userExistsUsername && userExistsUsername.id !== id) {
            return {
              statusCode: 400,
              body: "Username already in use.",
            };
          }
        }
      
        if(dataUser.password){
          dataUser.password = await hashPass(dataUser.password);
          
        }
      

      const fields: (keyof Pick<
        User,
        "name" | "username" | "password" | "profile_image" |"email"
      >)[] = ["name", "username", "password", "profile_image", "email"];
      for (const field of fields) {
        if (!dataUser[field]) {
          dataUser[field] = userExists[field]!;
        }
      }

      

      await this.userRepository.updateUser(id, dataUser);

      return {
        statusCode: 200,
        body: "User updated successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async removeUser(
    id: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExists = await this.userRepository.getUserById(id);
      if (!userExists)
        return {
          statusCode: 404,
          body: "User not found.",
        };
        
      await this.userRepository.removeUser(id);

      return {
        statusCode: 200,
        body: "User deleted successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }
}
