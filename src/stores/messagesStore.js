import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMessagesStore = defineStore("messages", () => {
  const messages = ref([]);
  const loading = ref(false);

  const unreadCount = computed(() => messages.value.filter((m) => !m.read).length);

  async function fetchMessages() {
    loading.value = true;
    try {
      const res = await fetch("/api/messages?_sort=createdAt&_order=desc");
      messages.value = await res.json();
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage({ name, email, phone, text }) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || "",
        text,
        read: false,
        createdAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error("Помилка відправки");
    return res.json();
  }

  async function markAsRead(id) {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    const msg = messages.value.find((m) => m.id === id);
    if (msg) msg.read = true;
  }

  async function deleteMessage(id) {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    messages.value = messages.value.filter((m) => m.id !== id);
  }

  return { messages, loading, unreadCount, fetchMessages, sendMessage, markAsRead, deleteMessage };
});
