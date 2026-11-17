
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Search meals by name
export async function searchMeals(query = '') {
  const response = await fetch(
    `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Unable to search for recipes.');
  }

  const data = await response.json();
  return data.meals || [];
}

// Get meals by category
export async function getMealsByCategory(category) {
  const response = await fetch(
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
  );

  if (!response.ok) {
    throw new Error('Unable to load this category.');
  }

  const data = await response.json();
  return data.meals || [];
}

// Get meals by area
export async function getMealsByArea(area) {
  const response = await fetch(
    `${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`
  );

  if (!response.ok) {
    throw new Error('Unable to load recipes from this area.');
  }

  const data = await response.json();
  return data.meals || [];
}

// Get full recipe details
export async function getMealDetails(id) {
  const response = await fetch(
    `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error('Unable to load recipe details.');
  }

  const data = await response.json();

  if (!data.meals || data.meals.length === 0) {
    throw new Error('Recipe not found.');
  }

  return data.meals[0];
}
