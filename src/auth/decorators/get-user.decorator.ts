import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

/**
 * GetUser is a custom decorator to extract the authenticated user's data from the request object.
 * 
 * @param data - The optional field to retrieve from the user object.
 * 
 * @returns The user object or a specific field of the user (if provided in the `data` parameter).
 * @throws InternalServerErrorException - If no user is found in the request object.
 */
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    // If `data` is provided, return the specified field from the user object.
    return (!data) ? user : user[data];
  }
);
