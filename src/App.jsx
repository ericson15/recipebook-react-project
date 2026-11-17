import React, { useState, useEffect } from 'react';
import { 
  Search, Heart, BookOpen, ShoppingBag, Filter, ArrowLeft, 
  Play, CheckCircle, Trash2, Plus, AlertCircle, RefreshCw, 
  ChefHat, Globe, Layers, X, Sparkles 
} from 'lucide-react';

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState('explore'); // explore, favorites, shopping, details
  const [selectedMealId, setSelectedMealId] = useState(null);
  
  // Data States
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeArea, setActiveArea] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load persistence on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('recipebook_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) { console.error(e); }
    }
    const savedShop = localStorage.getItem('recipebook_shopping');
    if (savedShop) {
      try { setShoppingList(JSON.parse(savedShop)); } catch (e) { console.error(e); }
    }
    
    fetchInitialMetadata();
    fetchMeals('');
  }, []);

  // Save favorites & shopping to localStorage
  useEffect(() => {
    localStorage.setItem('recipebook_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recipebook_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Categories and Areas for filters
  const fetchInitialMetadata = async () => {
    try {
      const catRes = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
      const catData = await catRes.json();
      if (catData.meals) setCategories(catData.meals);

      const areaRes = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
      const areaData = await areaRes.json();
      if (areaData.meals) setAreas(areaData.meals);
    } catch (err) {
      console.error('Failed to load filter metadata', err);
    }
  };

  // Main meal fetching function
  const fetchMeals = async (query = '', category = '', area = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
      
      if (category) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
      } else if (area) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
      } else if (query.trim() !== '') {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setMeals(data.meals || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recipes. Please check your network connection.');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full details of a specific meal
  const fetchMealDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      if (data.meals && data.meals[0]) {
        setSelectedMeal(data.meals[0]);
        setSelectedMealId(id);
        setCurrentTab('details');
      } else {
        throw new Error('Meal details not found.');
      }
    } catch (err) {
      setError('Could not load recipe details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Search Input Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveCategory('');
    setActiveArea('');
    fetchMeals(searchQuery, '', '');
  };

  // Handle Category Filter Click
  const handleCategorySelect = (cat) => {
    const newCat = activeCategory === cat ? '' : cat;
    setActiveCategory(newCat);
    setActiveArea('');
    setSearchQuery('');
    fetchMeals('', newCat, '');
  };

  // Handle Area Filter Click
  const handleAreaSelect = (ar) => {
    const newArea = activeArea === ar ? '' : ar;
    setActiveArea(newArea);
    setActiveCategory('');
    setSearchQuery('');
    fetchMeals('', '', newArea);
  };

  // Toggle Favorite
  const toggleFavorite = (meal) => {
    const exists = favorites.some((f) => f.idMeal === meal.idMeal);
    if (exists) {
      setFavorites(favorites.filter((f) => f.idMeal !== meal.idMeal));
      showToast(`Removed "${meal.strMeal}" from favorites.`);
    } else {
      setFavorites([...favorites, {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea
      }]);
      showToast(`Added "${meal.strMeal}" to favorites!`);
    }
  };

  // Add ingredients from meal to shopping list
  const addIngredientsToShoppingList = (meal) => {
    const newItems = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        const itemText = `${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`;
        newItems.push({
          id: `${meal.idMeal}-${i}-${Date.now()}`,
          text: itemText,
          recipeName: meal.strMeal,
          completed: false
        });
      }
    }
    setShoppingList([...shoppingList, ...newItems]);
    showToast(`Added ${newItems.length} ingredients to your shopping list!`);
  };

  const removeShoppingItem = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const toggleShoppingItem = (id) => {
    setShoppingList(shoppingList.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    showToast('Shopping list cleared.');
  };

  // Extract ingredients list from meal object for details view
  const getIngredientsList = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 text-stone-800 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce border border-amber-500/30">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setCurrentTab('explore'); setSelectedMealId(null); }}>
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                RecipeBook
              </h1>
              <p className="text-xs text-stone-500 font-medium">Powered by TheMealDB API</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => { setCurrentTab('explore'); setSelectedMealId(null); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                currentTab === 'explore' || currentTab === 'details'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'text-stone-600 hover:bg-orange-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            <button
              onClick={() => { setCurrentTab('favorites'); }}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                currentTab === 'favorites'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'text-stone-600 hover:bg-orange-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Favorites</span>
              {favorites.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  currentTab === 'favorites' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                }`}>
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setCurrentTab('shopping'); }}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                currentTab === 'shopping'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'text-stone-600 hover:bg-orange-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shopping List</span>
              {shoppingList.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  currentTab === 'shopping' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                }`}>
                  {shoppingList.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: EXPLORE & SEARCH */}
        {currentTab === 'explore' && (
          <div className="space-y-8">
            
            {/* Search & Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
                <ChefHat className="w-96 h-96" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Discover Culinary Excellence
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  What would you like to cook today?
                </h2>
                <p className="text-orange-100 text-sm sm:text-base">
                  Search through hundreds of delicious recipes, browse world cuisines, and build your shopping list instantly.
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-2xl p-2 shadow-lg mt-6">
                  <div className="pl-4 text-stone-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by recipe name (e.g. Chicken, Pasta, Curry)..."
                    className="w-full px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none text-sm sm:text-base bg-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-600/30 text-sm sm:text-base"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Filters Section (Categories & Areas) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-orange-600" />
                  <span>Categories</span>
                </h3>
                {(activeCategory || activeArea || searchQuery) && (
                  <button
                    onClick={() => { setActiveCategory(''); setActiveArea(''); setSearchQuery(''); fetchMeals('', '', ''); }}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Categories */}
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-200">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.strCategory;
                  return (
                    <button
                      key={cat.strCategory}
                      onClick={() => handleCategorySelect(cat.strCategory)}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center space-x-2 shadow-sm ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-stone-900/20'
                          : 'bg-white text-stone-700 hover:bg-orange-100/50 border border-stone-200/80'
                      }`}
                    >
                      <Layers className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-orange-500'}`} />
                      <span>{cat.strCategory}</span>
                    </button>
                  );
                })}
              </div>

              {/* Horizontal Scrollable Areas / Cuisines */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span>Cuisines / Areas</span>
                </h3>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-200">
                {areas.map((ar, index) => {
                  const isActive = activeArea === ar.strArea;
                  return (
                    <button
                      key={`area-${index}-${ar.strArea}`}
                      onClick={() => handleAreaSelect(ar.strArea)}
                      className={`px-4 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all shadow-sm ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-amber-600/30'
                          : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200/80'
                      }`}
                    >
                      {ar.strArea}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Grid / Status Handling */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-stone-900">
                  {activeCategory ? `${activeCategory} Recipes` : activeArea ? `${activeArea} Cuisines` : searchQuery ? `Results for "${searchQuery}"` : 'Popular Recipes'}
                </h3>
                <span className="text-sm text-stone-500 font-medium">
                  {meals ? `${meals.length} recipes found` : '0 recipes'}
                </span>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-stone-600 font-medium animate-pulse">Simmering up delicious recipes...</p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4 my-8">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-red-900 text-lg">Failed to load recipes</h4>
                    <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
                  </div>
                  <button
                    onClick={() => fetchMeals(searchQuery, activeCategory, activeArea)}
                    className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && (!meals || meals.length === 0) && (
                <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200/80 shadow-sm my-8">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                    <ChefHat className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-xl">No recipes found</h4>
                  <p className="text-stone-500 max-w-sm mx-auto text-sm">
                    We couldn't find any recipes matching your criteria. Try searching for something else or reset your filters.
                  </p>
                  <button
                    onClick={() => { setActiveCategory(''); setActiveArea(''); setSearchQuery(''); fetchMeals('', '', ''); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
                  >
                    Browse All Recipes
                  </button>
                </div>
              )}

              {/* Meals Grid */}
              {!loading && !error && meals && meals.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {meals.map((meal) => {
                    const isFav = favorites.some((f) => f.idMeal === meal.idMeal);
                    return (
                      <div
                        key={meal.idMeal}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 flex flex-col justify-between"
                      >
                        <div className="relative overflow-hidden aspect-video cursor-pointer" onClick={() => fetchMealDetails(meal.idMeal)}>
                          <img
                            src={meal.strMealThumb}
                            alt={meal.strMeal}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80"></div>
                          
                          {/* Category Badge */}
                          {meal.strCategory && (
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-900 font-bold text-xs px-3 py-1 rounded-full shadow">
                              {meal.strCategory}
                            </span>
                          )}

                          {/* Favorite Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(meal); }}
                            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                              isFav
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white/80 text-stone-700 hover:bg-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                          </button>

                          {meal.strArea && (
                            <span className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center space-x-1 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                              <Globe className="w-3 h-3 text-amber-400" />
                              <span>{meal.strArea}</span>
                            </span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                          <h4
                            onClick={() => fetchMealDetails(meal.idMeal)}
                            className="font-bold text-stone-900 text-base leading-snug cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                          >
                            {meal.strMeal}
                          </h4>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                            <button
                              onClick={() => fetchMealDetails(meal.idMeal)}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                            >
                              <span>View Recipe</span>
                              <span>&rarr;</span>
                            </button>
                            <button
                              onClick={() => fetchMealDetails(meal.idMeal)}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-2 rounded-xl transition-all"
                              title="Quick View"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: RECIPE DETAIL VIEW */}
        {currentTab === 'details' && selectedMeal && (
          <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
            
            {/* Back Button */}
            <button
              onClick={() => setCurrentTab('explore')}
              className="inline-flex items-center space-x-2 text-stone-600 hover:text-orange-600 font-semibold transition-colors bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Recipes</span>
            </button>

            {/* Hero Banner */}
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto">
                <img
                  src={selectedMeal.strMealThumb}
                  alt={selectedMeal.strMeal}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(selectedMeal)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-all ${
                    favorites.some(f => f.idMeal === selectedMeal.idMeal)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-stone-700 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${favorites.some(f => f.idMeal === selectedMeal.idMeal) ? 'fill-white' : ''}`} />
                </button>
              </div>

              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedMeal.strCategory && (
                      <span className="bg-orange-100 text-orange-800 font-bold text-xs px-3 py-1 rounded-full">
                        {selectedMeal.strCategory}
                      </span>
                    )}
                    {selectedMeal.strArea && (
                      <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{selectedMeal.strArea} Cuisine</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                    {selectedMeal.strMeal}
                  </h2>

                  {selectedMeal.strTags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedMeal.strTags.split(',').map((tag, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-lg font-medium">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-stone-100">
                  <button
                    onClick={() => addIngredientsToShoppingList(selectedMeal)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 px-6 rounded-2xl font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add All Ingredients to Shopping List</span>
                  </button>

                  {selectedMeal.strYoutube && (
                    <a
                      href={selectedMeal.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 px-6 rounded-2xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all"
                    >
                      <Play className="w-5 h-5 text-red-500 fill-red-500" />
                      <span>Watch Video Tutorial</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Ingredients and Instructions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Ingredients Column */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6 lg:col-span-1">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-extrabold text-stone-900 flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                    <span>Ingredients</span>
                  </h3>
                  <button
                    onClick={() => addIngredientsToShoppingList(selectedMeal)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl"
                  >
                    + Add to list
                  </button>
                </div>

                <ul className="space-y-3">
                  {getIngredientsList(selectedMeal).map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm py-2 border-b border-stone-100/60 last:border-0">
                      <span className="font-semibold text-stone-800">{item.ingredient}</span>
                      <span className="text-stone-500 font-medium bg-stone-50 px-2.5 py-1 rounded-lg text-xs">
                        {item.measure}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions Column */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6 lg:col-span-2">
                <h3 className="text-xl font-extrabold text-stone-900 flex items-center space-x-2 border-b border-stone-100 pb-4">
                  <ChefHat className="w-5 h-5 text-orange-600" />
                  <span>Step-by-Step Instructions</span>
                </h3>

                <div className="space-y-4 text-stone-700 leading-relaxed text-base whitespace-pre-line">
                  {selectedMeal.strInstructions}
                </div>

                {/* Video Embed Section if available */}
                {selectedMeal.strYoutube && (
                  <div className="pt-6 border-t border-stone-100 space-y-3">
                    <h4 className="font-bold text-stone-900 text-lg">Video Guide</h4>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedMeal.strYoutube.split('v=')[1]}`}
                        title={selectedMeal.strMeal}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: FAVORITES */}
        {currentTab === 'favorites' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-stone-900">Your Favorite Recipes</h2>
                <p className="text-stone-500 text-sm mt-1">Saved locally on your device for quick access anytime.</p>
              </div>
              <span className="bg-orange-100 text-orange-800 font-bold px-4 py-1.5 rounded-full text-sm">
                {favorites.length} Saved
              </span>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200/80 shadow-sm my-8">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-stone-900 text-xl">No favorites yet</h4>
                <p className="text-stone-500 max-w-sm mx-auto text-sm">
                  Click the heart icon on any recipe card or detail page to save your favorite dishes here.
                </p>
                <button
                  onClick={() => setCurrentTab('explore')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  Explore Recipes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((meal) => (
                  <div
                    key={meal.idMeal}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden aspect-video cursor-pointer" onClick={() => fetchMealDetails(meal.idMeal)}>
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80"></div>
                      
                      {meal.strCategory && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-900 font-bold text-xs px-3 py-1 rounded-full shadow">
                          {meal.strCategory}
                        </span>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(meal); }}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                      </button>

                      {meal.strArea && (
                        <span className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center space-x-1 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                          <Globe className="w-3 h-3 text-amber-400" />
                          <span>{meal.strArea}</span>
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <h4
                        onClick={() => fetchMealDetails(meal.idMeal)}
                        className="font-bold text-stone-900 text-base leading-snug cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                      >
                        {meal.strMeal}
                      </h4>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <button
                          onClick={() => fetchMealDetails(meal.idMeal)}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                        >
                          <span>View Recipe</span>
                          <span>&rarr;</span>
                        </button>
                        <button
                          onClick={() => toggleFavorite(meal)}
                          className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SHOPPING LIST */}
        {currentTab === 'shopping' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-stone-900">Interactive Shopping List</h2>
                <p className="text-stone-500 text-sm mt-1">Ingredients gathered from your favorite recipes.</p>
              </div>
              {shoppingList.length > 0 && (
                <button
                  onClick={clearShoppingList}
                  className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear List</span>
                </button>
              )}
            </div>

            {shoppingList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200/80 shadow-sm my-8">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-stone-900 text-xl">Your shopping list is empty</h4>
                <p className="text-stone-500 max-w-sm mx-auto text-sm">
                  Go to any recipe's detail view and click "Add All Ingredients to Shopping List" to populate your list!
                </p>
                <button
                  onClick={() => setCurrentTab('explore')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  Explore Recipes
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <span className="font-bold text-stone-700 text-sm">
                    {shoppingList.filter(i => i.completed).length} of {shoppingList.length} items checked
                  </span>
                  <div className="w-32 bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(shoppingList.filter(i => i.completed).length / shoppingList.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {shoppingList.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => toggleShoppingItem(item.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        item.completed
                          ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                          : 'bg-white border-stone-200/80 text-stone-800 hover:border-orange-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                          item.completed ? 'bg-orange-600 border-orange-600 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {item.completed && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{item.text}</p>
                          <p className="text-xs text-stone-400">For: {item.recipeName}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeShoppingItem(item.id); }}
                        className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200/80 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-stone-500 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-stone-800">RecipeBook App</span>
            <span>&bull;</span>
            <span>Powered by TheMealDB API</span>
          </div>
          <p>Designed with React & Tailwind CSS for culinary enthusiasts.</p>
        </div>
      </footer>

    </div>
  );
}