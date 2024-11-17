import { Request, Response } from "express";
import { Router } from "express";

// Models
import { User } from "../models/User";

// Services and Repositories
import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";

// Middleware
import { CustomRequest, validateToken } from "../middlewares/validateToken";
import { Email } from "../models/Email";

const router = Router();

const repositoryUser = new UserRepository();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { statusCode, body } = await new UserService(
      repositoryUser
    ).getAllUsers();

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { statusCode, body } = await new UserService(
      repositoryUser
    ).getUserById(id);

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/emailUser/:email", async (req: Request, res: Response)=>{
  try{
    const {email} = req.params;
    console.log(email)
    const { statusCode, body } = await new UserService(
      repositoryUser
    ).emailEnv(email);

    res.status(statusCode).json(body);

  }catch (error) {
    res.status(500).json({ error: error });
  };
});

router.post("/feedback/", async (req: Request, res: Response) => {
  try{
    const data = req.body;
    const requiredFields: (keyof Email)[] = [
      "email",
      "text",
      "name"
    ]

    for(const field of requiredFields){
      if (data[field] === null || data[field] === undefined || data[field]?.toString().trim() === "") {
        return res.status(400).json(`The field ${field} is required.`);
      }
    }

    const { statusCode, body } = await new UserService(
      repositoryUser
    ).Feedback(data.email, data.text, data.name);

    res.status(statusCode).json(body);
  }catch (error) {
    res.status(500).json({ error: error });
  };
})

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const requiredFields: (keyof User)[] = [
      "name",
      "username",
      "email",
      "password",
      "confirmPassword",
      "isAdmin",
    ];
    for (const field of requiredFields) {
      if (data[field] === null || data[field] === undefined || data[field]?.toString().trim() === "") {
        return res.status(400).json(`The field ${field} is required.`);
      }
    }

    if (data.password !== data.confirmPassword)
      return res.status(400).json("Passwords do not match.");
    if (data.password.length < 8)
      return res
        .status(400)
        .json("The password needs at least eight characters.");

    const { statusCode, body } = await new UserService(
      repositoryUser
    ).addUser(data);

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.body;
  const { statusCode, body } = await new UserService(
    repositoryUser
  ).updateUser(id, user);

  res.status(statusCode).json(body);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { statusCode, body } = await new UserService(
    repositoryUser
  ).removeUser(id);

  res.status(statusCode).json(body);
});

router.post("/token", validateToken, async (req: Request, res: Response) => {
  const userId = (req as CustomRequest).userId;
  res.send(userId);
});

export default router;
