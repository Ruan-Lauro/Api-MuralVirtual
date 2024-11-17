import { Notification } from "../models/Notification";
import { HttpResponse } from "./interfaces";

export interface INotificationRepository {

  getAllNotification(): Promise<Notification[]>;
  addNotification(Notification: Notification): Promise<Notification | null>;
  removeNotification(id: string): Promise<Notification | null>;
  getNotificationById(id: string): Promise<Notification | null>;
}

export interface INotificationService {
  getAllNotifications(): Promise<HttpResponse<Notification[]>>;
  addNotification(data: Notification): Promise<HttpResponse<Omit<Notification, "">>>;
  removeNotification(id: string): Promise<HttpResponse<Omit<Notification, "">>>;
  getNotificationById(id: string): Promise<HttpResponse<Omit<Notification, "">>>;
}