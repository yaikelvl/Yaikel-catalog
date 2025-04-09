import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';

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
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await this.cloudinaryClient.uploader.upload(file.path, {
        public_id: options?.publicId,
        folder: options?.folder,
      });

      const optimizedUrl = this.cloudinaryClient.url(result.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        secure: true,
      });

      return { url: optimizedUrl, publicId: result.public_id };
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

 /**
   * Método simple para subir una o varias imágenes y obtener sus URLs
   * @param files - Archivo único o array de archivos
   * @param folder - Carpeta en Cloudinary (opcional)
   * @returns - URLs de las imágenes optimizadas
   */
 async uploadImages(
  files: Express.Multer.File | Express.Multer.File[],
  folder?: string
): Promise<{ url: string, publicId: string }[]> {
  try {
    // Convertir a array si es un solo archivo
    const fileArray = Array.isArray(files) ? files : [files];
    const results = [];

    for (const file of fileArray) {
      // Subir la imagen a Cloudinary
      const result = await this.cloudinaryClient.uploader.upload(file.path, {
        folder: folder || 'uploads',
        resource_type: 'auto'
      });

      // Crear URL optimizada
      const optimizedUrl = this.cloudinaryClient.url(result.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        secure: true
      });

      results.push({
        url: optimizedUrl,
        publicId: result.public_id
      });

      // Eliminar el archivo temporal del servidor si existe
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return results;
  } catch (error) {
    throw new BadRequestException(`Error al subir imágenes: ${error.message}`);
  }
}


}