import { SetMetadata } from '@nestjs/common';

export const SKIP_API_LOG = 'skipApiLog';
export const SkipApiLog = () => SetMetadata(SKIP_API_LOG, true);
