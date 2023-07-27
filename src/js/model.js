import { API_KEY, API_URL, RES_PER_PAGE } from "./config";
import { AJAX } from "./helpers";

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

function createRecipeObject(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    bookmarked: false,
    ...(recipe.key && { key: recipe.key }),
  };
}

export async function loadRecipe(id) {
  try {
    // Fetch recipe
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    // Transform recipe data
    const { recipe } = data.data;
    state.recipe = createRecipeObject(recipe);

    if (state.bookmarks.some((rec) => rec.id === recipe.id)) {
      state.recipe.bookmarked = true;
    }
  } catch (err) {
    throw err;
  }
}

export async function loadSearchResults(query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      image: recipe.image_url,
      ...(recipe.key && { key: recipe.key }),
    }));
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
}

export function getSearchResultsPage(page = state.search.page) {
  state.search.page = page;
  return state.search.results.slice(
    (page - 1) * state.search.resultsPerPage,
    state.search.resultsPerPage * page
  );
}

export function updateServings(newServings) {
  state.recipe.ingredients.forEach(
    (ing) =>
      (ing.quantity = (ing.quantity / state.recipe.servings) * newServings)
  );
  state.recipe.servings = newServings;
}

function persistBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
  // Add recipe to bookmark
  state.bookmarks.push(recipe);

  // Mark recipe as a bookmark
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  // Store bookmarks change in localstorage
  persistBookmarks();
}

export function deleteBookmark(recipeId) {
  // Find bookmark index
  const index = state.bookmarks.findIndex((recipe) => recipe.id === recipeId);

  // Delete recipe from bookmark
  state.bookmarks.splice(index, 1);

  // Unmark the recipe bookmark
  state.recipe.bookmarked = false;

  // Store bookmarks change in localstorage
  persistBookmarks();
}

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(
        (recipe) => recipe[0].startsWith("ingredient") && recipe[1] !== ""
      )
      .map((ing) => {
        const ingArr = ing[1].split(",").map((ing) => ing.trim());
        if (ingArr.length !== 3) {
          throw new Error(
            "Wrong ingredient format! Please use the correct format :)"
          );
        }
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };
    const { data } = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data.recipe);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
}

function init() {
  // Get bookmarks from localStorage
  const storage = localStorage.getItem("bookmarks");

  // Set bookmarks state if there is bookmarks in localStorage
  if (!storage) {
    return;
  }
  state.bookmarks = JSON.parse(storage);
}
init();
