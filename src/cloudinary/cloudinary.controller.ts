import { Controller, Post, Get, Body, UseInterceptors, UploadedFile, Query, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/url')
  async uploadFromUrl(
    @Body() body: { imageUrl: string; publicId?: string; folder?: string },
  ) {
    return this.cloudinaryService.uploadFromUrl(body.imageUrl, {
      publicId: body.publicId,
      folder: body.folder,
    });
  }

  @Post('upload/file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { publicId?: string; folder?: string },
  ) {
    return this.cloudinaryService.uploadFile(file, {
      publicId: body.publicId,
      folder: body.folder,
    });
  }

  @Get('optimize')
  getOptimizedUrl(
    @Query('publicId') publicId: string,
    @Query('width') width?: number,
    @Query('height') height?: number,
    @Query('crop') crop?: string,
  ) {
    return {
      url: this.cloudinaryService.getOptimizedUrl(publicId, {
        width,
        height,
        crop,
      }),
    };
  }

  @Get('auto-crop')
  getAutoCropUrl(
    @Query('publicId') publicId: string,
    @Query('width') width: number,
    @Query('height') height: number,
  ) {
    return {
      url: this.cloudinaryService.getAutoCropUrl(publicId, width, height),
    };
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}