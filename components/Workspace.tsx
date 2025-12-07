import React, { useState } from 'react';
import { 
  Printer, Save, PenTool, CheckCircle, FileText, 
  User, Calendar, MapPin, Activity, Lightbulb, HelpCircle, 
  Newspaper, ArrowRight
} from 'lucide-react';
import { Article, W1HAnswers, W1HQuotes } from '../types';
import W1HInput from './W1HInput';
import { analyzeArticleWithAI } from '../services/geminiService';

interface WorkspaceProps {
  article: Article | null;
  answers: W1HAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<W1HAnswers>>;
  quotes: W1HQuotes;
  setQuotes: React.Dispatch<React.SetStateAction<W1HQuotes>>;
  onSave: () => void;
  onPrint: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  article, 
  answers, 
  setAnswers, 
  quotes,
  setQuotes,
  onSave, 
  onPrint 
}) => {
  const [isAiWorking, setIsAiWorking] = useState(false);

  const handleInputChange = (field: keyof W1HAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleAiAnalyze = async () => {
    if (!article) return;
    setIsAiWorking(true);
    try {
      const result = await analyzeArticleWithAI(article.content);
      setAnswers(result.answers);
      setQuotes(result.quotes);
    } catch (error) {
      alert("AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAiWorking(false);
    }
  };

  // Function to highlight text based on quotes
  const renderHighlightedContent = (content: string) => {
    // If no quotes, return plain text split by paragraphs
    const hasQuotes = Object.values(quotes).some(arr => arr.length > 0);
    if (!hasQuotes) {
      return content.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
        <p key={idx} className="mb-6 last:mb-0 text-justify break-keep whitespace-pre-line">
          {paragraph}
        </p>
      ));
    }

    // Helper to get color class based on type
    const getHighlightClass = (type: string) => {
      switch(type) {
        case 'who': return 'bg-red-200/80 rounded px-0.5 box-decoration-clone';
        case 'when': return 'bg-orange-200/80 rounded px-0.5 box-decoration-clone';
        case 'where': return 'bg-amber-200/80 rounded px-0.5 box-decoration-clone';
        case 'what': return 'bg-emerald-200/80 rounded px-0.5 box-decoration-clone';
        case 'how': return 'bg-sky-200/80 rounded px-0.5 box-decoration-clone';
        case 'why': return 'bg-violet-200/80 rounded px-0.5 box-decoration-clone';
        default: return '';
      }
    };

    return content.split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => {
      // Find all matches in this paragraph
      interface Match {
        start: number;
        end: number;
        type: string;
      }
      let matches: Match[] = [];

      (Object.keys(quotes) as Array<keyof W1HQuotes>).forEach(type => {
        quotes[type].forEach(quote => {
          if (!quote || quote.length < 2) return; // Skip too short quotes
          let startIndex = 0;
          let index;
          // Find all occurrences of the quote in the paragraph
          while ((index = paragraph.indexOf(quote, startIndex)) > -1) {
            matches.push({
              start: index,
              end: index + quote.length,
              type: type
            });
            startIndex = index + 1;
          }
        });
      });

      // Sort matches by start position
      matches.sort((a, b) => a.start - b.start);

      // Resolve overlaps (simple strategy: if overlaps, keep the first one and skip the second)
      // A better strategy might be needed for nested overlaps, but this is decent for now.
      const consolidatedMatches: Match[] = [];
      let lastEnd = 0;
      
      matches.forEach(match => {
        if (match.start >= lastEnd) {
          consolidatedMatches.push(match);
          lastEnd = match.end;
        }
      });

      // Build the paragraph elements
      const elements = [];
      let currentIdx = 0;

      consolidatedMatches.forEach((match, mIdx) => {
        // Text before match
        if (match.start > currentIdx) {
          elements.push(paragraph.substring(currentIdx, match.start));
        }
        // Match text
        elements.push(
          <span key={`match-${pIdx}-${mIdx}`} className={getHighlightClass(match.type)} title={match.type.toUpperCase()}>
            {paragraph.substring(match.start, match.end)}
          </span>
        );
        currentIdx = match.end;
      });

      // Remaining text
      if (currentIdx < paragraph.length) {
        elements.push(paragraph.substring(currentIdx));
      }

      return (
        <p key={pIdx} className="mb-6 last:mb-0 text-justify break-keep whitespace-pre-line leading-loose">
          {elements}
        </p>
      );
    });
  };

  if (!article) {
    return (
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 print-shadow-none print-border-0 print-full min-h-[600px] flex flex-col items-center justify-center text-slate-400 p-8">
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-slate-100 animate-pulse">
          <FileText size={48} className="text-slate-300" />
        </div>
        <p className="text-2xl font-bold text-slate-700 mb-3">학습할 주제를 선택하세요</p>
        <p className="text-base text-slate-400 max-w-sm text-center leading-relaxed">
          왼쪽에서 추천 기사를 선택하거나<br/>
          궁금한 키워드를 검색하여 탐구를 시작해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 print-shadow-none print-border-0 print-full min-h-screen flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white/95 backdrop-blur rounded-t-2xl sticky top-0 z-10 print-hidden shadow-sm gap-3 md:gap-0">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
          <PenTool size={18} className="text-indigo-600" />
          탐구 활동
        </h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* AI Tools */}
          <div className="flex items-center gap-2 mr-2 pr-4 border-r border-slate-200">
            <button 
              onClick={handleAiAnalyze}
              disabled={isAiWorking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
            >
              <Activity size={14} className={isAiWorking ? "animate-pulse" : ""} />
              AI 자동 분석
            </button>
          </div>

          <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition-all border border-slate-200 whitespace-nowrap">
            <Save size={16} /> 저장
          </button>
          <button onClick={onPrint} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap">
            <Printer size={16} /> 출력
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 lg:p-10 print-p-0">
        {/* Article Section */}
        <div className="mb-12 border-b-2 border-slate-100 pb-12 print-pb-6 print-mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 print-text-black print-border-0">
              {article.category}
            </span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded print-hidden">
              <Newspaper size={12} /> {article.source}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight break-keep">
            {article.title}
          </h1>
          
          {/* Content Box with Highlighting */}
          <div className="prose prose-lg max-w-none text-slate-700 leading-9 md:leading-10 bg-slate-50 p-8 rounded-2xl border border-slate-100 print-bg-white print-border-0 print-p-0 print-text-black shadow-inner transition-all duration-500">
            {renderHighlightedContent(article.content)}
          </div>
        </div>

        {/* 5W1H Section */}
        <div className="print-break-before-auto">
          <div className="flex items-center justify-between mb-8 print-mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2.5 rounded-xl print-hidden shadow-lg transform -rotate-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                육하원칙(5W1H) 분석
              </h3>
            </div>
            {/* Call to action for AI if empty */}
            {!answers.who && !isAiWorking && (
               <button onClick={handleAiAnalyze} className="print-hidden flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-xs font-bold hover:underline transition-all">
                 <Activity size={14}/> AI 도움 받기 <ArrowRight size={14}/>
               </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            <W1HInput 
              label="누가" engLabel="WHO" icon={User}
              value={answers.who}
              onChange={(e) => handleInputChange('who', e.target.value)}
              placeholder="이 이야기의 주인공은 누구인가요?" 
              accentColor="border-red-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="언제" engLabel="WHEN" icon={Calendar}
              value={answers.when}
              onChange={(e) => handleInputChange('when', e.target.value)}
              placeholder="사건이 일어난 시간이나 때는 언제인가요?" 
              accentColor="border-orange-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="어디서" engLabel="WHERE" icon={MapPin}
              value={answers.where}
              onChange={(e) => handleInputChange('where', e.target.value)}
              placeholder="사건이 발생한 장소는 어디인가요?" 
              accentColor="border-amber-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="무엇을" engLabel="WHAT" icon={Activity}
              value={answers.what}
              onChange={(e) => handleInputChange('what', e.target.value)}
              placeholder="어떤 사건이나 행동이 있었나요?" 
              accentColor="border-emerald-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="어떻게" engLabel="HOW" icon={Lightbulb}
              value={answers.how}
              onChange={(e) => handleInputChange('how', e.target.value)}
              placeholder="어떤 방법이나 과정으로 일어났나요?" 
              accentColor="border-sky-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="왜" engLabel="WHY" icon={HelpCircle}
              value={answers.why}
              onChange={(e) => handleInputChange('why', e.target.value)}
              placeholder="이 일이 일어난 이유나 원인은 무엇인가요?" 
              accentColor="border-violet-500"
              isAiLoading={isAiWorking}
            />
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print-block mt-8 pt-4 border-t border-slate-300 text-center">
          <p className="text-xs text-slate-400 font-medium">탐구 생활 - 뉴스 분석 학습지</p>
          <p className="text-[10px] text-slate-300 mt-1">{new Date().toLocaleDateString()} 출력</p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;