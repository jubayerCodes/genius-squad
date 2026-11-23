import { Response } from 'express';

export interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export function sendResponse<T>(res: Response, resData: ApiResponse<T>): void {
  const statusCode = resData.statusCode || (resData.success ? 200 : 400);

  res.status(statusCode).json({
    success: resData.success,
    statusCode,
    message: resData.message || (resData.success ? 'সফল হয়েছে (Success)' : 'অনুরোধ ব্যর্থ হয়েছে'),
    data: resData.data,
    meta: resData.meta,
  });
}

export default sendResponse;
