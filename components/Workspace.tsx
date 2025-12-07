import React, { useState } from 'react';
import { 
  Printer, Save, PenTool, CheckCircle, FileText, 
  User, Calendar, MapPin, Activity, Lightbulb, HelpCircle, 
  Newspaper, Wand2, ArrowRight
} from 'lucide-react';
import { Article, W1HAnswers } from '../types';
import W1HInput from './W1HInput';
import { analyzeArticleWithAI, simplifyTextWithAI } from '../services/geminiService';

interface WorkspaceProps {
  article: Article | null;
  answers: W1HAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<W1HAnswers>>;
  onSave: () => void;
  onPrint: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  article, 
  answers, 
  setAnswers, 
  onSave, 
  onPrint 
}) => {
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [displayContent, setDisplayContent] = useState<string>('');
  const [isSimplified, setIsSimplified] = useState(false);

  // Update local display content when article changes
  React.useEffect(() => {
    if (article) {
      setDisplayContent(article.content);
      setIsSimplified(false);
    }
  }, [article]);

  const handleInputChange = (field: keyof W1HAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleAiAnalyze = async () => {
    if (!article) return;
    setIsAiWorking(true);
    try {
      const result = await analyzeArticleWithAI(article.content);
      setAnswers(result);
    } catch (error) {
      alert("AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleAiSimplify = async () => {
    if (!article || isSimplified) return;
    setIsAiWorking(true);
    try {
      const simpleText = await simplifyTextWithAI(article.content);
      setDisplayContent(simpleText);
      setIsSimplified(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (article) {
      setDisplayContent(article.content);
      setIsSimplified(false);
    }
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
          워크스페이스
        </h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* AI Tools */}
          <div className="flex items-center gap-2 mr-2 pr-4 border-r border-slate-200">
             <button 
              onClick={isSimplified ? handleRestoreOriginal : handleAiSimplify}
              disabled={isAiWorking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap
                ${isSimplified 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              {isAiWorking && !answers.who ? <Wand2 size={14} className="animate-spin"/> : <Wand2 size={14} />}
              {isSimplified ? '원문 보기' : 'AI 쉽게 읽기'}
            </button>
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
            {isSimplified && (
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1 animate-fade-in-up">
                 <Wand2 size={10} /> AI가 쉽게 요약함
               </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight break-keep">
            {article.title}
          </h1>
          
          {/* Content Box */}
          <div className={`prose prose-lg max-w-none text-slate-700 leading-9 md:leading-10 bg-slate-50 p-8 rounded-2xl border border-slate-100 print-bg-white print-border-0 print-p-0 print-text-black shadow-inner transition-all duration-500 ${isSimplified ? 'ring-2 ring-emerald-100 bg-emerald-50/30' : ''}`}>
            {displayContent.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
              <p key={idx} className="mb-6 last:mb-0 text-justify break-keep whitespace-pre-line">
                {paragraph}
              </p>
            ))}
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
                 <Activity size={14}/> AI에게 도움 요청하기 <ArrowRight size={14}/>
               </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            <W1HInput 
              label="누가" engLabel="WHO" icon={User}
              value={answers.who}
              onChange={(e) => handleInputChange('who', e.target.value)}
              placeholder="기사의 주인공이나 관련 인물은 누구입니까?" 
              accentColor="border-red-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="언제" engLabel="WHEN" icon={Calendar}
              value={answers.when}
              onChange={(e) => handleInputChange('when', e.target.value)}
              placeholder="사건이 일어난 시점은 언제입니까?" 
              accentColor="border-orange-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="어디서" engLabel="WHERE" icon={MapPin}
              value={answers.where}
              onChange={(e) => handleInputChange('where', e.target.value)}
              placeholder="배경이 되는 장소는 어디입니까?" 
              accentColor="border-amber-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="무엇을" engLabel="WHAT" icon={Activity}
              value={answers.what}
              onChange={(e) => handleInputChange('what', e.target.value)}
              placeholder="주요 사건이나 대상은 무엇입니까?" 
              accentColor="border-emerald-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="어떻게" engLabel="HOW" icon={Lightbulb}
              value={answers.how}
              onChange={(e) => handleInputChange('how', e.target.value)}
              placeholder="어떤 과정이나 방법으로 진행되었습니까?" 
              accentColor="border-sky-500"
              isAiLoading={isAiWorking}
            />
            <W1HInput 
              label="왜" engLabel="WHY" icon={HelpCircle}
              value={answers.why}
              onChange={(e) => handleInputChange('why', e.target.value)}
              placeholder="그 일이 일어난 원인은 무엇입니까?" 
              accentColor="border-violet-500"
              isAiLoading={isAiWorking}
            />
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print-block mt-8 pt-4 border-t border-slate-300 text-center">
          <p className="text-xs text-slate-400 font-medium">Inquiry Life AI - 뉴스 분석 학습지</p>
          <p className="text-[10px] text-slate-300 mt-1">{new Date().toLocaleDateString()} 출력</p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;