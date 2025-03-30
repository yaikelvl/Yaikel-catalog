import type { WSGateway } from "src/websockets/websocket.gateway";
import type { Logger } from "winston";

/**
 * LogNotifyHelper is a utility class that helps in logging messages and sending notifications
 * through a WebSocket gateway. It formats the log messages with a specific context and sends
 * them to the notification gateway.
 */
export class LogNotifyHelper {
  /**
   * 
   * @param logger - A logger instance for logging messages.
   * @param notificationGateway - An instance of the WebSocket gateway for sending notifications.
   * @param context - A string that represents the context of the operation, used for formatting log messages.
   */
  constructor(
    private readonly logger: Logger,
    private readonly notificationGateway: WSGateway,
    private readonly context: string,
  ) {}

  /**
   * Logs a message with the specified context and sends it as a notification.
   * The message is formatted to include the context for better traceability.
   *
   * @param message - The message to log and send as a notification.
   */
  
  logOperation(message: string) {
    const formattedMessage = `[${this.context}] ${message}`;
    this.logger.info(formattedMessage);
    this.notificationGateway.sendNotification(formattedMessage);
  }
}
