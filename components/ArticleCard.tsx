import React from 'react';
import { Newspaper } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all group relative border duration-200
        ${isSelected 
          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-200 shadow-md translate-x-1' 
          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${article.source === '위키백과' ? 'bg-slate-600' : 'bg-blue-500'}`}>
          {article.category}
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Newspaper size={10} /> {article.source}
        </span>
      </div>
      <h3 className={`font-bold text-sm mb-1 leading-snug transition-colors line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800 group-hover:text-indigo-700'}`}>
        {article.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed opacity-80">
        {article.content}
      </p>
    </button>
  );
};

export default ArticleCard;