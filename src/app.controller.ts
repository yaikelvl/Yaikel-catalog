import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly appService: AppService,
  ) {}

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadImage(@UploadedFile() file: Express.Multer.File) {
  //   return this.appService.uploadImageToCloudinary(file);
  // }
}

