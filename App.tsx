import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Trash2, Clock, ChevronRight, Menu, X } from 'lucide-react';
import { Article, SavedDocument, W1HAnswers, RECOMMENDED_ARTICLES, Difficulty, W1HQuotes } from './types';
import { generateEducationalArticle } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';

const INITIAL_ANSWERS: W1HAnswers = {
  who: '', when: '', where: '', what: '', how: '', why: ''
};

const INITIAL_QUOTES: W1HQuotes = {
  who: [], when: [], where: [], what: [], how: [], why: []
};

const App = () => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [articleList, setArticleList] = useState<Article[]>(RECOMMENDED_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<W1HAnswers>(INITIAL_ANSWERS);
  const [quotes, setQuotes] = useState<W1HQuotes>(INITIAL_QUOTES);
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  useEffect(() => {
    const storedDocs = localStorage.getItem('inquiryLifeDocs_v3');
    if (storedDocs) {
      setSavedDocs(JSON.parse(storedDocs));
    }
  }, []);

  const handleGenerate = async (manualQuery?: string) => {
    const topic = manualQuery || query;
    if (!topic.trim()) return;

    if (manualQuery) setQuery(manualQuery);
    setIsGenerating(true);
    setMobileMenuOpen(false);
    
    try {
      // 위키 검색 대신 AI 글 생성 호출, 난이도 전달
      const newArticle = await generateEducationalArticle(topic, difficulty);
      // 기존 목록의 맨 앞에 추가
      setArticleList(prev => [newArticle, ...prev]);
      // 생성된 글 바로 선택
      handleSelectArticle(newArticle);
    } catch (error) {
      alert("글 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setAnswers(INITIAL_ANSWERS);
    setQuotes(INITIAL_QUOTES);
    // On mobile, close menu/sidebar after selection
    setMobileMenuOpen(false); 
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearList = () => {
    if (articleList.length === 0) return;
    if (window.confirm("생성된 글 목록을 모두 삭제하시겠습니까?")) {
      setArticleList([]);
      if (selectedArticle && articleList.some(a => a.id === selectedArticle.id)) {
        setSelectedArticle(null);
      }
    }
  };

  const handleSave = () => {
    if (!selectedArticle) return;
    
    const newDoc: SavedDocument = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      articleTitle: selectedArticle.title,
      answers: { ...answers }
    };

    const updatedDocs = [newDoc, ...savedDocs];
    setSavedDocs(updatedDocs);
    localStorage.setItem('inquiryLifeDocs_v3', JSON.stringify(updatedDocs));
    alert('활동지가 저장되었습니다.');
  };

  const handleDeleteDoc = (id: number) => {
    if(!window.confirm('삭제하시겠습니까?')) return;
    const updatedDocs = savedDocs.filter(doc => doc.id !== id);
    setSavedDocs(updatedDocs);
    localStorage.setItem('inquiryLifeDocs_v3', JSON.stringify(updatedDocs));
  };

  const handleLoadDoc = (doc: SavedDocument) => {
    setSelectedArticle({
      id: String(doc.id),
      title: doc.articleTitle,
      content: "저장된 활동지 모드입니다. 원문 내용은 저장 시점의 내용과 다를 수 있어 표시하지 않거나, 검색을 통해 다시 찾아볼 수 있습니다.",
      category: '저장됨',
      source: '내 보관함',
      readTime: '-',
      keywords: []
    });
    setAnswers(doc.answers);
    setQuotes(INITIAL_QUOTES); // 저장된 문서에는 하이라이팅 정보가 없으므로 초기화
    setShowSavedList(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 print:bg-white flex flex-col">
      
      {/* Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 print-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI 탐구생활</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">AI 육하원칙 학습 도구</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSavedList(!showSavedList)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-md border border-indigo-500"
            >
              <Save size={18} />
              <span className="hidden sm:inline">보관함</span>
              <span className="bg-black/20 text-xs px-2 py-0.5 rounded-full">{savedDocs.length}</span>
            </button>
            <button 
              className="lg:hidden p-2 text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-8 flex-1 w-full relative">
        
        {/* Left Sidebar */}
        <div className={`
          lg:block
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-30 w-80 bg-slate-100 p-4 shadow-2xl transform translate-x-0 transition-transform duration-300' : 'hidden'}
          lg:relative lg:w-[350px] lg:shadow-none lg:bg-transparent lg:p-0 lg:translate-x-0
        `}>
           <div className="lg:hidden flex justify-end mb-2">
             <button onClick={() => setMobileMenuOpen(false)}><X className="text-slate-500"/></button>
           </div>
           <Sidebar 
            query={query} 
            setQuery={setQuery} 
            isSearching={isGenerating} 
            onSearch={handleGenerate} 
            articleList={articleList}
            selectedArticleId={selectedArticle?.id}
            onSelectArticle={handleSelectArticle}
            showSavedList={showSavedList}
            onClearList={handleClearList}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
           />
        </div>
        
        {/* Saved List Overlay */}
        {showSavedList && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Save size={20} className="text-indigo-600" /> 저장된 활동
                </h2>
                <button onClick={() => setShowSavedList(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <ChevronRight size={20} className="rotate-90 text-slate-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 flex-1 space-y-3">
                {savedDocs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Save size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">저장된 내용이 없습니다.</p>
                  </div>
                ) : (
                  savedDocs.map(doc => (
                    <div key={doc.id} className="p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-xl flex justify-between items-center group transition-all bg-white shadow-sm">
                      <div onClick={() => handleLoadDoc(doc)} className="cursor-pointer flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{doc.articleTitle}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12}/> {doc.date}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <Workspace 
          article={selectedArticle} 
          answers={answers} 
          setAnswers={setAnswers}
          quotes={quotes}
          setQuotes={setQuotes}
          onSave={handleSave}
          onPrint={() => window.print()}
        />
      </main>
    </div>
  );
};

export default App;