import request from "./request";

export function fetchUserInfo() {
  return request.get("/api/user/info");
}

export function updateUserInfo(data) {
  return request.post("/api/user/update", data);
}

export function uploadAvatar(formData) {
  return request.post("/api/user/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
} 