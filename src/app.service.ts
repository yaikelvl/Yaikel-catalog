import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class AppService {
  constructor(private cloudinary: CloudinaryService) {}

  
  getHello(): string {
    return 'Hello World!';
  }
}
