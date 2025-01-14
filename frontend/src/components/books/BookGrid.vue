<script setup>
import {useUserStore} from "@/stores/userStore.js";
const userStore = useUserStore();
</script>

<template>
  <div class="container grid-container">
    <div class="row" v-if="filteredBooks.length > 0">
      <TransitionGroup>
      <div
          v-for="(book, index) in filteredBooks"
          :key="book.id"
          :class="[
          'col-12 col-md-6 col-lg-3 mb-4',
        ]"
      >
          <BookCard  :book="book" :isLoggedIn="userStore.isLoggedIn"></BookCard>

      </div>
      </TransitionGroup>
    </div>
    <div class="text-center text-white" v-else>
      <h5>Sorry, no results were found.<br>Try out a different search or change your filters.</h5>
    </div>
  </div>
</template>

<script>
import BookCard from "@/components/books/BookCard.vue";
import {useFilterStore} from "@/stores/filterStore.js";
import {useUserStore} from "@/stores/userStore.js";

export default {
  components: {BookCard},
  props: {
    books: {
      type: Array,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      filterStore: useFilterStore(),
    };
  },
  computed: {
    filteredBooks() {
      let filteredBooks = this.books;

      if (this.filterStore.favOnly) {
        filteredBooks = this.books.filter(book => {
          return useUserStore().isFavorite(book.id);
        });
      }

      const query = this.searchQuery.toLowerCase();
      if (!query) {
        return filteredBooks; // No search query, just return the favorite-filtered books
      }

      return filteredBooks.filter(book =>
          book.title.toLowerCase().includes(query) ||
          book.categories.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }
  }
};
</script>

<style scoped>
.grid-container {
  width: 80%;
  padding-left: 0;
  padding-right: 0;
  max-width: 80%;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(20%);
}


</style>
