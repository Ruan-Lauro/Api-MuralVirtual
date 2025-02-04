import { Request, Response } from "express";
import { Router } from "express";
import fetch from 'node-fetch';


// Models
import { Notification } from '../models/Notification';

// Services and Repositories
import { NoficationRepository } from "../repositories/notificationRepository";
import { NotificationService } from "../services/notificationService";
import { MemberService } from "../services/memberService";
import { MemberRepository } from "../repositories/memberRepository";
import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/userService";
import { GroupService } from '../services/groupService';
import { GroupRepository } from '../repositories/groupRepository';

const router = Router();

const repositoryNotification = new NoficationRepository();
const repositoryMember = new MemberRepository();
const repositoryUser = new UserRepository();
const repositoryGroup = new GroupRepository();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { statusCode, body } = await new NotificationService(
      repositoryNotification
    ).getAllNotifications();

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { statusCode, body } = await new NotificationService(
      repositoryNotification
    ).getNotificationById(id);

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
  console.log("POST ROUTER: NOTIFICATION")
    const data = req.body;
   
    const requiredFields: (keyof Notification)[] = [
      "token",
      "userId",
    ];

    for (const field of requiredFields) {
      if (data[field] === null || data[field] === undefined || data[field]?.toString().trim() === "") {
        return res.status(400).json(`The field ${field} is required.`);
      }
    }

    const { statusCode, body } = await new NotificationService(
      repositoryNotification
    ).addNotification(data);

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { body: bodyL } = await new NotificationService(repositoryNotification).getAllNotifications();

  if (typeof bodyL !== "string") {
    const notification = bodyL.find(value => value.token === id);

    if (notification) {
      const { statusCode, body } = await new NotificationService(repositoryNotification).removeNotification(notification.id);

      res.status(statusCode).json(body);
    } else {
      res.status(404).json({ message: 'Token error' });
    }
  }
});



const sendPushNotification = async (expoPushToken: string, message: string, data: string[]) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    console.log("Deu erro no primeiro");
    console.error('Invalid Expo Push Token:', expoPushToken);
    return;
  }
  console.log("Passei do primeiro");
  console.log(expoPushToken);
  const payload = {
    to: expoPushToken,
    sound: 'default',
    title: `${data[0]} publicou no(a) ${data[1]}`,
    body: message,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending push notification:', error);
      throw new Error(`Push notification failed with status ${response.status}`);
    }

    console.log('Push notification sent successfully!');
    return await response.json();
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
};


router.post('/send-notification', async (req, res) => {
  const { groupId, message, userId, data} = req.body;

  const { body } = await new NotificationService(repositoryNotification).getAllNotifications();
  const { body: bodyM } = await new MemberService(repositoryMember).getAllMembers();
  const { body: bodyU } = await new UserService(repositoryUser).getAllUsers();
  const { body: bodyG } = await new GroupService(repositoryGroup).getAllGroups();

  if (typeof bodyM !== "string" && typeof body !== "string" && typeof bodyU !== "string" && typeof bodyG !== "string") {
      const groupL = bodyG.filter(valueg => valueg.id == groupId); 
      const memberL = bodyM.filter(valueM => valueM.groupId === groupId);
      const userLG = bodyU.filter(user => groupL.some(member => member.userId === user.id));
      const userL = bodyU.filter(user => memberL.some(member => member.userId === user.id));

      const filteredUserL = userL;
      const combinedUsers = [
          ...filteredUserL,
          ...userLG,
      ];


      const usersToNotify = combinedUsers.filter(user => user.id !== userId);
      //
      console.log(usersToNotify)
      console.log(userId)
      const notifications = body.filter(token =>
          usersToNotify.some(user => user.id === token.userId)
      ).map(token => sendPushNotification(token.token, message, data));
      await Promise.all(notifications);
      console.log("Passei do último");
      res.status(200).json({ message: 'Notificações enviadas' });
  }
});

export default router;