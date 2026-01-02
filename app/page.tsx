'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Mail, MessageSquare } from 'lucide-react';

interface AnalysisResult {
  riskLevel: 'Safe' | 'Suspicious' | 'High Risk Fraud';
  reason: string;
  businessImpact: string;
  recommendedAction: string;
  suggestedReply: {
    neutral?: string;
    polite?: string;
    legal?: string;
  };
  leadQualityScore?: number;
  businessInsight: string;
  isLead: boolean;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'Suspicious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High Risk Fraud': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Safe': return <CheckCircle className="w-6 h-6" />;
      case 'Suspicious': return <AlertTriangle className="w-6 h-6" />;
      case 'High Risk Fraud': return <Shield className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Business Intelligence AI Agent</h1>
          </div>
          <p className="text-lg text-gray-600">
            Advanced message analysis, fraud detection, and smart response system
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Paste Business Message for Analysis
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste email, chat message, inquiry, or business communication here..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={analyzeMessage}
            disabled={loading || !message.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 mr-2" />
                Analyze Message
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-4">
            {/* Risk Level Card */}
            <div className={`border-2 rounded-xl p-6 ${getRiskColor(analysis.riskLevel)}`}>
              <div className="flex items-center mb-2">
                {getRiskIcon(analysis.riskLevel)}
                <h2 className="text-xl font-bold ml-2">Risk Level: {analysis.riskLevel}</h2>
              </div>
              <p className="text-sm mt-2">{analysis.reason}</p>
            </div>

            {/* Business Impact */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Business Impact
              </h3>
              <p className="text-gray-700">{analysis.businessImpact}</p>
            </div>

            {/* Recommended Action */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                Recommended Action
              </h3>
              <p className="text-gray-700 font-medium">{analysis.recommendedAction}</p>
            </div>

            {/* Lead Quality Score */}
            {analysis.isLead && analysis.leadQualityScore !== undefined && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Lead Quality Score
                </h3>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          analysis.leadQualityScore >= 7 ? 'bg-green-600' :
                          analysis.leadQualityScore >= 4 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${analysis.leadQualityScore * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-2xl font-bold text-gray-900">
                    {analysis.leadQualityScore}/10
                  </span>
                </div>
              </div>
            )}

            {/* Suggested Replies */}
            {analysis.suggestedReply && Object.keys(analysis.suggestedReply).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-600" />
                  Suggested Replies
                </h3>
                <div className="space-y-4">
                  {analysis.suggestedReply.neutral && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">NEUTRAL TONE</p>
                      <p className="text-gray-700">{analysis.suggestedReply.neutral}</p>
                    </div>
                  )}
                  {analysis.suggestedReply.polite && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <p className="text-xs font-semibold text-blue-700 mb-2">POLITE & FIRM</p>
                      <p className="text-gray-700">{analysis.suggestedReply.polite}</p>
                    </div>
                  )}
                  {analysis.suggestedReply.legal && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <p className="text-xs font-semibold text-red-700 mb-2">LEGAL / COMPLIANCE-SAFE</p>
                      <p className="text-gray-700">{analysis.suggestedReply.legal}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Insight */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Business Insight
              </h3>
              <p className="text-blue-50">{analysis.businessInsight}</p>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        {!analysis && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <Shield className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fraud Detection</h3>
              <p className="text-gray-600 text-sm">
                Identify scams, phishing, impersonation, and social engineering tactics
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lead Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Score lead quality and identify high-value sales opportunities
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <MessageSquare className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Responses</h3>
              <p className="text-gray-600 text-sm">
                Generate professional, context-aware replies in multiple tones
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
