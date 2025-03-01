import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        //console.log(ctx.switchToHttp().getRequest().user);

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new InternalServerErrorException('User not found (request)')
        }
       
            //Asi se hace un ternario
        return (!data) 
        ? user 
        : user[data];
    }
);