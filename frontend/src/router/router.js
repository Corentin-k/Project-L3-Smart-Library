// src/router/router.js

import { createRouter, createWebHistory } from 'vue-router';
import Home from "@/views/Home.vue";

// Configuration des routes
const routes = [

  {path: '/', redirect:'/home'},
  {path: '/home', name: "Home",component: Home},
];

// Création du routeur
const router = createRouter({
  history: createWebHistory(), // Utilise l'historique du navigateur
  routes
});



export default router;