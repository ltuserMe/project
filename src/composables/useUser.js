import { ref } from "vue";
import { fetchUserInfo, updateUserInfo, uploadAvatar as uploadAvatarApi } from "@/api/user";

export function useUser() {
  const userInfo = ref({});
  const isLoading = ref(false);

  async function loadUserInfo() {
    isLoading.value = true;
    const res = await fetchUserInfo();
    console.log("🚀 ~ loadUserInfo ~ res:", res)
    if (res.success) {
      const { nickname, avatar, createdAt } = res.data;
      userInfo.value = {
        nickname,
        avatar,
        originalAvatar: avatar,
        createdAt: new Date(createdAt),
      };
    }
    isLoading.value = false;
  }

  // 上传头像方法，参数为 file
  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    return uploadAvatarApi(formData);
  }

  return { userInfo, isLoading, loadUserInfo, uploadAvatar };
} 