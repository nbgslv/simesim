interface ApiError extends Error {
  success: boolean;
  message: string;
}

type ApiResult<T> = {
  success: boolean;
  data: T;
};

export type ApiResponse<T> = ApiResult<T> | ApiError;
