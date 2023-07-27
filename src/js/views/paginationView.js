import icons from "../../img/icons.svg";
import View from "./View";

class PaginationView extends View {
  _parentEl = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline");
      if (!btn) {
        return;
      }
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _btnPrevMarkup() {
    return `
    <button data-goto="${
      this._data.page - 1
    }" class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${this._data.page - 1}</span>
    </button>
    `;
  }

  _btnNextMarkup() {
    return `
    <button data-goto="${
      this._data.page + 1
    }" class="btn--inline pagination__btn--next">
      <span>Page ${this._data.page + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>
    `;
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // On the page 1 and there are other page
    if (this._data.page === 1 && numPages > 1) {
      return this._btnNextMarkup();
    }

    // On the page 1 and no other page
    if (numPages === 1) {
      return ``;
    }

    // On the last page
    if (this._data.page === numPages) {
      return this._btnPrevMarkup();
    }

    // On the other page
    return `
    ${this._btnPrevMarkup()}
    ${this._btnNextMarkup()}
    `;
  }
}

export default new PaginationView();
