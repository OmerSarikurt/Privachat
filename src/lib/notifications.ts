/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { decryptMessage } from './encryption';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  get hasPermission(): boolean {
    return this.permission === 'granted';
  }

  showNotification(title: string, body: string, icon?: string) {
    if (this.permission !== 'granted' || document.hasFocus()) return;

    try {
      new Notification(title, {
        body,
        icon: icon || '/vite.svg',
        silent: false,
      });
    } catch (e) {
      console.error('Failed to show notification', e);
    }
  }

  notifyNewMessage(chatId: string, encryptedText: string, senderName: string = 'New Message') {
    const text = decryptMessage(encryptedText, chatId);
    this.showNotification(`Privachat: ${senderName}`, text);
  }
}

export const notificationService = NotificationService.getInstance();
