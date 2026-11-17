
import { Heart, Globe, BookOpen } from 'lucide-react';

function RecipeCard({ meal, onSelect, isFavorite, onToggleFavorite }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 flex flex-col justify-between">

      {/* Recipe Image */}
      <div
        className="relative overflow-hidden aspect-video cursor-pointer"
        onClick={() => onSelect(meal.idMeal)}
      >
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal || 'Recipe'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80"></div>

        {meal.strCategory && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-900 font-bold text-xs px-3 py-1 rounded-full shadow">
            {meal.strCategory}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(meal);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/80 text-stone-700 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
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
          onClick={() => onSelect(meal.idMeal)}
          className="font-bold text-stone-900 text-base leading-snug cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
        >
          {meal.strMeal}
        </h4>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <button
            onClick={() => onSelect(meal.idMeal)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View Recipe</span>
            <span>&rarr;</span>
          </button>

          <button
            onClick={() => onSelect(meal.idMeal)}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-2 rounded-xl transition-all"
            title="Quick View"
            aria-label={`Quick view ${meal.strMeal || 'recipe'}`}
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
