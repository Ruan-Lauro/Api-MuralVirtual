import { PrismaClient } from "@prisma/client";
import { Notification } from '../models/Notification';
import { INotificationRepository } from "../interfaces/notificationInterface";

const prisma = new PrismaClient();

export class NoficationRepository implements INotificationRepository {

    async getNotificationById(id:string): Promise<Notification| null> {
        try {
            return await prisma.notificationToken.findUnique({
              where: {
                id: id,
              },
            });
          } catch (error) {
            throw new Error(`error: ${error}`);
          }
    }


    async getAllNotification(): Promise<Notification[]> {
        try {
            return await prisma.notificationToken.findMany();
        } catch (error) {
            throw new Error(`error: ${error}`);
        }
    }

    async addNotification({
        token,
        userId,
      }: Notification): Promise<Notification | null> {
        try {
          return await prisma.notificationToken.create({
            data: {
              token,
              userId,
              createdAt: new Date(),
            },
          });
        } catch (error) {
          throw new Error(`error: ${error}`);
        }
    }

    async removeNotification(id: string): Promise<Notification | null> {
        try {
          return await prisma.notificationToken.delete({
            where: {
              id: id
            }
          })
        } catch (error) {
          throw new Error(`error: ${error}`);
        }  
      }
}