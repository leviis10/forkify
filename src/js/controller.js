import { MODAL_CLOSE_SEC } from "./config";
import {
  addBookmark,
  deleteBookmark,
  getSearchResultsPage,
  loadRecipe,
  loadSearchResults,
  state,
  updateServings,
  uploadRecipe,
} from "./model";
import addRecipeView from "./views/addRecipeView";
import bookmarksView from "./views/bookmarksView";
import paginationView from "./views/paginationView";
import recipeView from "./views/recipeView";
import resultsView from "./views/resultsView";
import searchView from "./views/searchView";

async function controlRecipes() {
  try {
    // Variable definition
    const id = window.location.hash.slice(1);
    if (!id) {
      return;
    }

    // Update result and bookmark view to active
    resultsView.update(getSearchResultsPage());
    bookmarksView.update(state.bookmarks);

    // Render loading spinner
    recipeView.renderSpinner();

    // Load recipe
    await loadRecipe(id);

    // Render recipe view
    recipeView.render(state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
}

async function controlSearchResults() {
  try {
    // get search query
    const query = searchView.getQuery();
    if (!query) {
      return;
    }

    // Render spinner
    resultsView.renderSpinner();

    // Load search result
    await loadSearchResults(query);

    // Render search result
    resultsView.render(getSearchResultsPage());

    // Render pagination
    paginationView.render(state.search);
  } catch (err) {
    resultsView.renderError();
  }
}

function controlPagination(goto) {
  // Render results
  resultsView.render(getSearchResultsPage(goto));

  // Render pagination
  paginationView.render(state.search);
}

function controlServings(newServings) {
  // Update recipe servings
  updateServings(newServings);

  // Update recipe view
  recipeView.update(state.recipe);
}

function controlAddBookmark() {
  // Add / remove bookmark
  if (!state.recipe.bookmarked) {
    addBookmark(state.recipe);
  } else {
    deleteBookmark(state.recipe.id);
  }

  // Update recipe view bookmark state
  recipeView.update(state.recipe);

  // Render bookmark recipe to bookmark view
  bookmarksView.render(state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // Upload recipe
    addRecipeView.renderSpinner();
    await uploadRecipe(newRecipe);

    // Display success message
    addRecipeView.renderMessage();

    // Change url location
    window.history.pushState(null, "", `#${state.recipe.id}`);

    // Render recipe, bookmark view
    recipeView.render(state.recipe);
    bookmarksView.render(state.bookmarks);

    // Close form window
    setTimeout(() => addRecipeView.toggleWindow(), MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
