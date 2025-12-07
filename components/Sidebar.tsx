import React, { useState } from 'react';
import { Search, Loader2, Globe, Sparkles } from 'lucide-react';
import { Article, SUGGESTED_KEYWORDS } from '../types';
import ArticleCard from './ArticleCard';

interface SidebarProps {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  onSearch: (q?: string) => void;
  articleList: Article[];
  selectedArticleId?: string;
  onSelectArticle: (article: Article) => void;
  showSavedList: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  query,
  setQuery,
  isSearching,
  onSearch,
  articleList,
  selectedArticleId,
  onSelectArticle,
  showSavedList
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'recommend'>('search');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  if (showSavedList) return null; // Logic handled in parent, this is just for layout flow

  return (
    <div className="lg:w-[350px] flex flex-col gap-6 print-hidden flex-shrink-0">
      {/* Search Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
          <Globe size={16} /> 지식 탐험
        </h2>
        <form onSubmit={handleSubmit} className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="주제 입력 (예: 이순신)"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            {isSearching ? <Loader2 size={14} className="animate-spin"/> : 'Go'}
          </button>
        </form>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400"/> 추천 키워드
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map(keyword => (
              <button
                key={keyword}
                onClick={() => onSearch(keyword)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                #{keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article List */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-400px)] min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="font-bold text-slate-700 text-sm">
            {isSearching ? '백과사전 검색 중...' : '검색 결과'}
          </span>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            {articleList.length}
          </span>
        </div>
        
        {isSearching ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 rounded-full opacity-20 animate-ping"></div>
              <Loader2 size={32} className="animate-spin text-indigo-500 relative z-10"/>
            </div>
            <p className="text-sm font-medium">지식을 찾아오는 중입니다...</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-2 space-y-2 flex-1 scroll-smooth">
            {articleList.length > 0 ? (
              articleList.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSelected={selectedArticleId === article.id}
                  onClick={() => onSelectArticle(article)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <Search size={48} className="mb-3 opacity-20" />
                <p className="text-sm">검색 결과가 없습니다.</p>
                <p className="text-xs mt-2 opacity-60">키워드를 변경하여 다시 검색해보세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;