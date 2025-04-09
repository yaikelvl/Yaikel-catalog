// src/cloudinary/cloudinary.provider.ts
import { Provider } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { envs } from '../common/config/envs';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: () => {
    cloudinary.config({
      cloud_name: envs.cloudinaryCloudName,
      api_key: envs.cloudinaryApiKey,
      api_secret: envs.cloudinaryApiSecret,
    });
    return cloudinary;
  },
  inject: [],
};