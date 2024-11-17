import { HttpResponse } from "../interfaces/interfaces";
import { INotificationRepository, INotificationService } from "../interfaces/notificationInterface";
import { Notification } from '../models/Notification';

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository
  ) {}
    async getAllNotifications(): Promise<HttpResponse<Notification[]>> {
        try {
            const notificationToken = await this.notificationRepository.getAllNotification();
      
            if (!notificationToken)
              return {
                statusCode: 400,
                body: "No Notification Token found.",
            };
      
            return {
              statusCode: 200,
              body: notificationToken,
            };

        } catch (error) {
            return {
              statusCode: 500,
              body: `Error: ${error}`,
            };
        }
    }

    async getNotificationById(id: string): Promise<HttpResponse<Omit<Notification, "">>> {
        try {
            const notification = await this.notificationRepository.getNotificationById(id);
            if (!notification)
              return {
                statusCode: 404,
                body: "NotificationToken not found.",
              };
      
      
            return {
              statusCode: 200,
              body: notification,
            };
          } catch (error) {
            return {
              statusCode: 500,
              body: `Error: ${error}`,
            };
          }
    }

    async addNotification(data: Notification): Promise<HttpResponse<Omit<Notification, "">>> {
       try {
        const notificationToken = await this.notificationRepository.getAllNotification();
        const trueNoti = notificationToken.map(value=> value.token === data.token);
        console.log(trueNoti)
        if(trueNoti.length !== 0)
        return {
            statusCode: 400,
            body: "NotificationToken already exists.",
        };
        await this.notificationRepository.addNotification(data);
      return {
        statusCode: 201,
        body: "tokenNotification created successfully.",
      };

       } catch (error) {
        return {
            statusCode: 500,
            body: `Error: ${error}`,
          };
       }
    }
     async removeNotification(id: string): Promise<HttpResponse<Omit<Notification, "">>> {
        try {
            const userExists = await this.notificationRepository.getNotificationById(id);
            if (!userExists)
              return {
                statusCode: 404,
                body: "NotificationToken not found.",
              };
              
            await this.notificationRepository.removeNotification(id);
      
            return {
              statusCode: 200,
              body: "NotificationToken deleted successfully.",
            };
          } catch (error) {
            return {
              statusCode: 500,
              body: `Error: ${error}`,
            };
          }
    }

  
}