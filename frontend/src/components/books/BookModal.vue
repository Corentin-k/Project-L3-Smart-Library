<script setup>
import {useUserStore} from "@/stores/userStore.js";
import ModalLogin from "@/components/Login.vue";

const userStore = useUserStore();

const props = defineProps({
  book: {
    Object,
    required: true,
  }
});

const emit = defineEmits(['click-favorite']);

function switchToLogin() {
  $("#modalLogin").modal('show');
}

function onClickFavorite() {
  emit('click-favorite');
}
</script>
<template>
  <div class="modal fade" :id="'bookModal-' + book.id" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-center align-items-center">
          <i v-if="userStore.isLoggedIn && userStore.isFavorite(book.id)"
             class="bi-heart-fill"
             style="margin-right: auto; color: red"
             aria-hidden="true"
          ></i>
          <h4 class="modal-title w-100">{{ book.title }}</h4>

          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row align-items-center justify-content-center">
            <div class="col-4">
              <img
                  :src="book.cover"
                  :alt="book.title"
                  class="img-fluid coverimg"
              />
            </div>
            <div class="col-6">
              <h6 class="mb-1">Author:
                <span>
                  {{book.author}}
                </span>
              </h6>
              <h6 class="mb-3">Categories:
                <!--  <span v-for="(category, index) in this.book.categories" :key="index">
                {{ category }}<span v-if="index < this.book.categories.length - 1">, </span>-->
                <span>
                  {{book.categories}}

              </span>
              </h6>
              <p style="text-align: justify; white-space: normal">{{book.description}}
              </p>
            </div>

          </div>

        </div>
        <div class="modal-footer">
          <div class="col" v-if="userStore.isLoggedIn">
            <button class="btn btn-primary" v-if="!userStore.isFavorite(book.id)" @click="onClickFavorite">Add to favorites</button>
            <button class="btn btn-danger" v-else @click="onClickFavorite">Remove from favorites</button>
          </div>
          <div class="col" v-else>
            <button class="btn btn-primary" disabled style="cursor: not-allowed;">Add to favorites</button>
            <p class="mt-1">You need to<a href="#" class="text-decoration-none" data-dismiss="modal" @click="switchToLogin">login</a>to
              manage favorites
            </p>

            <ModalLogin ref="modalLogin"></ModalLogin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coverimg {
  max-width: 200px;
}
</style>