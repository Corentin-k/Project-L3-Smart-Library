<template>
  <div id="app">
    <NavBar @open-login="openLogin" @search="handleSearch"></NavBar>
    <div v-if="isLoginModalVisible" class="modal" @click.self="closeLogin">
      <Login @close="closeLogin"></Login>
    </div>
    <router-view :searchQuery="searchQuery"></router-view>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Login from "@/components/Login.vue";

export default {
  name: 'App',
  components: {NavBar, Login},
  data() {
    return {
      isLoginModalVisible: false, // État pour la modal
      searchQuery: ''
    };
  },
  methods: {
    openLogin() {
      this.isLoginModalVisible = true; // Ouvrir la modal
    },
    closeLogin() {
      this.isLoginModalVisible = false; // Fermer la modal
    },
    handleSearch(query) {
      this.searchQuery = query;
      console.log(this.searchQuery);
    },
  }
};
</script>
<style scoped>
/* Global styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 2rem;
  background-color: rgb(24, 24, 24);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Couche semi-transparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Doit être au-dessus du reste du contenu */
}

/* Styles pour centrer la modale */

</style>
