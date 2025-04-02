import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * RawHeaders is a custom param decorator that extracts the raw headers from the incoming request.
 * It can be used in a controller method to access the raw headers directly.
 * 
 * @param data - Optional parameter for specific header extraction. If not provided, all raw headers are returned.
 * 
 * @returns The raw headers of the request.
 */
export const RawHeaders = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        
        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;
    }
);
