

const baseUrl =
  process.env.NODE_ENV === "development"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}`;

interface CustomRequestInit extends RequestInit {
  params?: Record<string, any>;
}



const requestInterceptor = async (options: CustomRequestInit) => {
  // 在这里可以添加 token 或者其他统一的请求设置
  const headers = {};

  // 确保只在客户端访问 localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    token && Object.assign(headers, { Authorization: token });
  }

  options.headers = {
    ...options.headers,
    ...headers,
  };
  return options;
};
const responseInterceptor = async (response: Response) => {
  if (response.status === 401) {
    // /userAdmin/${type}/getAll

    // 重定向到登录页面
    // localStorage.removeItem("token");
    // window.location.href = "/";
    // return Promise.reject(new Error("Unauthorized: Redirecting to login"));
  }
  if (response.status === 403) {
    // 显示禁止访问信息
    // alert("Access denied: You do not have permission to access this resource.");
    return Promise.reject(new Error("Forbidden: Access denied"));
  }
  // 处理 500 Internal Server Error
  if (response.status === 500) {
    // 显示服务器错误信息
    // alert("An error occurred on the server. Please try again later.");
    return Promise.reject(new Error("Internal Server Error"));
  }
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.message || "API Request Failed");
  // }
  return response;
};
export const fetcher = async <T>(
  url: string,
  options: CustomRequestInit = {}
): Promise<IResponse<T>> => {
  const modifiedOptions = await requestInterceptor(options);
  let searchParams = "";
  if (options.params) {
    const str = new URLSearchParams(options.params).toString();
    searchParams = `?${str}`;
  }
  const response = await fetch(
    `${baseUrl}${url}${searchParams}`,
    modifiedOptions
  );
  await responseInterceptor(response);
  const result: IResponse<T> = await response.json();

  if (result.code === 501) {
    // event.emit("login");
  }
  return result;
};
