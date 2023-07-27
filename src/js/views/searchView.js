class SearchView {
  #parentElement = document.querySelector(".search");

  constructor() {}

  addHandlerSearch(handler) {
    this.#parentElement.addEventListener("submit", function (e) {
      e.preventDefault();
      handler();
    });
  }

  getQuery() {
    const query = this.#parentElement.querySelector(".search__field").value;
    this.#clearInput();
    return query;
  }

  #clearInput() {
    this.#parentElement.querySelector(".search__field").value = "";
  }
}

export default new SearchView();
