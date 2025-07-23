<template>
  <LoginPage @login-success="handleLoginSuccess" />
</template>

<script setup>
import LoginPage from "@/components/LoginPage.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function handleLoginSuccess() {
  router.push("/");
}
</script> 