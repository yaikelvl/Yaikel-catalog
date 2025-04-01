// src/cloudinary/cloudinary.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { UploadApiResponse, UploadApiErrorResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinaryClient) {}

  /**
   * Sube una imagen a Cloudinary desde una URL
   */
  async uploadFromUrl(
    imageUrl: string,
    options?: { publicId?: string; folder?: string },
  ): Promise<UploadApiResponse> {
    try {
      return await this.cloudinaryClient.uploader.upload(imageUrl, {
        public_id: options?.publicId,
        folder: options?.folder,
      });
    } catch (error) {
      throw new BadRequestException(`Error al subir imagen: ${error.message}`);
    }
  }

  /**
   * Sube un archivo (imagen) desde el sistema local a Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: { publicId?: string; folder?: string },
  ): Promise<UploadApiResponse> {
    try {
      return await this.cloudinaryClient.uploader.upload(file.path, {
        public_id: options?.publicId,
        folder: options?.folder,
      });
    } catch (error) {
      throw new BadRequestException(`Error al subir archivo: ${error.message}`);
    }
  }

  /**
   * Sube una imagen desde un buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    options?: { publicId?: string; folder?: string },
  ): Promise<UploadApiResponse> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = this.cloudinaryClient.uploader.upload_stream(
          {
            public_id: options?.publicId,
            folder: options?.folder,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        
        uploadStream.end(buffer);
      });
    } catch (error) {
      throw new BadRequestException(`Error al subir buffer: ${error.message}`);
    }
  }

  /**
   * Genera una URL optimizada con transformaciones
   */
  getOptimizedUrl(publicId: string, options?: { width?: number; height?: number; crop?: string; quality?: string; format?: string }) {
    return this.cloudinaryClient.url(publicId, {
      fetch_format: options?.format || 'auto',
      quality: options?.quality || 'auto',
      width: options?.width,
      height: options?.height,
      crop: options?.crop,
    });
  }

  /**
   * Genera una URL con auto-crop
   */
  getAutoCropUrl(publicId: string, width: number, height: number) {
    return this.cloudinaryClient.url(publicId, {
      crop: 'auto',
      gravity: 'auto',
      width,
      height,
    });
  }

  /**
   * Elimina una imagen por su publicId
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      return await this.cloudinaryClient.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar imagen: ${error.message}`);
    }
  }
}