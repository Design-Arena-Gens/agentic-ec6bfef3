import { NextRequest, NextResponse } from 'next/server';

interface FraudIndicator {
  pattern: RegExp;
  weight: number;
  type: string;
}

const fraudIndicators: FraudIndicator[] = [
  { pattern: /urgent|immediately|act now|hurry|time.?sensitive/i, weight: 2, type: 'urgency_pressure' },
  { pattern: /verify.{0,20}account|confirm.{0,20}identity|update.{0,20}payment/i, weight: 3, type: 'phishing' },
  { pattern: /suspended|locked|restricted|unauthorized|unusual.{0,10}activity/i, weight: 3, type: 'fear_tactic' },
  { pattern: /wire.{0,10}transfer|bitcoin|cryptocurrency|gift.?card|prepaid/i, weight: 4, type: 'suspicious_payment' },
  { pattern: /ceo|director|manager.{0,20}requesting/i, weight: 3, type: 'authority_impersonation' },
  { pattern: /congratulations|winner|prize|lottery|inheritance/i, weight: 4, type: 'too_good_to_be_true' },
  { pattern: /click.{0,10}here|bit\\.ly|tinyurl|suspicious.{0,10}link/i, weight: 2, type: 'suspicious_link' },
  { pattern: /password|social.?security|bank.{0,10}account|credit.?card/i, weight: 3, type: 'credential_request' },
  { pattern: /refund|overpayment|tax.{0,10}return/i, weight: 2, type: 'financial_lure' },
  { pattern: /confidential|do.?not.{0,10}share|secret|discreet/i, weight: 2, type: 'secrecy_request' },
];

const leadIndicators = [
  /interested.{0,20}in.{0,20}(your|our).{0,20}(product|service)/i,
  /looking.{0,20}for.{0,20}(solution|provider|vendor)/i,
  /quote|proposal|pricing|budget|cost/i,
  /demo|trial|meeting|call|discuss/i,
  /partnership|collaboration|business.{0,10}opportunity/i,
];

const businessKeywords = [
  /inquiry|request|question|information/i,
  /complaint|issue|problem|dissatisfied/i,
  /support|help|assistance|trouble/i,
  /order|purchase|buy|product/i,
  /contract|agreement|terms/i,
];

function analyzeMessage(message: string) {
  let riskScore = 0;
  const detectedIndicators: string[] = [];

  // Check fraud indicators
  fraudIndicators.forEach(indicator => {
    if (indicator.pattern.test(message)) {
      riskScore += indicator.weight;
      detectedIndicators.push(indicator.type);
    }
  });

  // Determine risk level
  let riskLevel: 'Safe' | 'Suspicious' | 'High Risk Fraud';
  if (riskScore >= 8) {
    riskLevel = 'High Risk Fraud';
  } else if (riskScore >= 4) {
    riskLevel = 'Suspicious';
  } else {
    riskLevel = 'Safe';
  }

  // Check if it's a lead
  const isLead = leadIndicators.some(pattern => pattern.test(message));
  let leadQualityScore = 0;

  if (isLead) {
    // Score based on various factors
    const hasBudgetMention = /budget|price|cost|\$\d+/i.test(message);
    const hasTimeline = /asap|next.{0,10}week|next.{0,10}month|soon|timeline/i.test(message);
    const hasSpecifics = message.length > 100 && /specific|require|need|must have/i.test(message);
    const hasContactInfo = /@|phone|email|contact/i.test(message);
    const hasProfessionalTone = message.split(' ').length > 20 && !/\?\?\?|!!!|all caps/i.test(message);

    leadQualityScore = 3; // Base score
    if (hasBudgetMention) leadQualityScore += 2;
    if (hasTimeline) leadQualityScore += 2;
    if (hasSpecifics) leadQualityScore += 1;
    if (hasContactInfo) leadQualityScore += 1;
    if (hasProfessionalTone) leadQualityScore += 1;

    leadQualityScore = Math.min(10, leadQualityScore);
  }

  // Determine intent
  let intent = 'general_inquiry';
  if (isLead) intent = 'sales_lead';
  else if (/complaint|unhappy|dissatisfied|refund/i.test(message)) intent = 'complaint';
  else if (/support|help|how.{0,10}to|problem/i.test(message)) intent = 'support_request';
  else if (/negotiate|discuss.{0,10}terms|counter.{0,10}offer/i.test(message)) intent = 'negotiation';

  // Generate reason
  let reason = '';
  if (riskLevel === 'High Risk Fraud') {
    reason = `Multiple high-risk fraud indicators detected: ${detectedIndicators.slice(0, 3).join(', ')}. Message exhibits classic scam patterns including ${detectedIndicators[0] || 'manipulation tactics'}.`;
  } else if (riskLevel === 'Suspicious') {
    reason = `Detected suspicious patterns: ${detectedIndicators.join(', ')}. Exercise caution and verify sender authenticity before responding.`;
  } else {
    reason = 'Message appears legitimate with standard business communication patterns. No significant fraud indicators detected.';
  }

  // Business impact
  let businessImpact = '';
  if (riskLevel === 'High Risk Fraud') {
    businessImpact = 'High risk of financial loss, data breach, or reputation damage. Responding or engaging could lead to wire fraud, credential theft, or business email compromise (BEC).';
  } else if (riskLevel === 'Suspicious') {
    businessImpact = 'Moderate risk. Potential for phishing attack, data exposure, or operational disruption if proper verification is not conducted.';
  } else if (isLead) {
    businessImpact = `Potential revenue opportunity. Lead quality score indicates ${leadQualityScore >= 7 ? 'high' : leadQualityScore >= 4 ? 'moderate' : 'low'} conversion probability.`;
  } else {
    businessImpact = 'Standard business communication. Low risk with normal operational handling required.';
  }

  // Recommended action
  let recommendedAction = '';
  if (riskLevel === 'High Risk Fraud') {
    recommendedAction = 'DO NOT RESPOND. Mark as spam/phishing. Report to IT security team. Block sender. Do not click any links or provide any information.';
  } else if (riskLevel === 'Suspicious') {
    recommendedAction = 'Verify sender identity through independent channels (official website, known phone number). Do not use contact information from the message. Escalate to security team if verification fails.';
  } else if (isLead) {
    if (leadQualityScore >= 7) {
      recommendedAction = 'High-priority lead. Assign to senior sales representative. Schedule qualification call within 24 hours. Prepare customized proposal.';
    } else if (leadQualityScore >= 4) {
      recommendedAction = 'Moderate-quality lead. Send initial response with company information. Schedule discovery call. Qualify budget and timeline.';
    } else {
      recommendedAction = 'Low-priority lead. Send automated response with resources. Add to nurture campaign. Monitor for engagement signals.';
    }
  } else if (intent === 'complaint') {
    recommendedAction = 'Escalate to customer service manager. Respond within 4 hours acknowledging concern. Investigate issue and prepare resolution plan.';
  } else if (intent === 'support_request') {
    recommendedAction = 'Route to support team. Acknowledge receipt within 2 hours. Provide ticket number and expected resolution timeline.';
  } else {
    recommendedAction = 'Respond with standard business communication protocol. Address inquiry professionally within 24-48 hours.';
  }

  // Suggested replies
  const suggestedReply: any = {};

  if (riskLevel === 'Safe') {
    if (isLead) {
      suggestedReply.neutral = `Thank you for your inquiry. We'd be happy to discuss how our solutions can meet your needs. Could you share more details about your specific requirements and timeline?`;
      suggestedReply.polite = `Thank you for reaching out to us! We appreciate your interest in our services. I'd love to schedule a brief call to better understand your needs and explore how we can help. When would be a convenient time for you?`;
    } else if (intent === 'complaint') {
      suggestedReply.neutral = `Thank you for bringing this to our attention. We take all feedback seriously and will investigate this matter immediately. Could you provide additional details so we can resolve this quickly?`;
      suggestedReply.polite = `We sincerely apologize for any inconvenience you've experienced. Your satisfaction is our priority, and we're committed to making this right. Our team will investigate this immediately and follow up within 24 hours.`;
    } else {
      suggestedReply.neutral = `Thank you for your message. We've received your inquiry and will respond with the information you need within 1-2 business days.`;
      suggestedReply.polite = `Thank you for reaching out! We've received your message and our team is reviewing it. We'll get back to you shortly with a detailed response.`;
    }
  } else if (riskLevel === 'Suspicious') {
    suggestedReply.polite = `Thank you for your message. For security purposes, we need to verify this request through our standard authentication process. Please contact us directly at [official company phone/email] to proceed.`;
    suggestedReply.legal = `We have received your communication. Per our security protocols, we cannot process requests of this nature via this channel. Please contact our official support line at [number] and reference case ID [XXX] for verification and assistance.`;
  } else {
    suggestedReply.legal = `This message has been flagged by our security systems. We do not respond to unverified requests. If you are a legitimate sender, please contact us through official channels listed on our website.`;
  }

  // Business insight
  let businessInsight = '';
  if (riskLevel === 'High Risk Fraud') {
    businessInsight = 'Train team members to recognize similar fraud patterns. Implement email authentication (SPF, DKIM, DMARC). Consider security awareness program.';
  } else if (isLead && leadQualityScore >= 7) {
    businessInsight = 'High-value opportunity detected. Fast response critical for conversion. Assign to top performer. Track progression through sales pipeline.';
  } else if (isLead) {
    businessInsight = 'Lead requires nurturing. Set up automated follow-up sequence. Monitor engagement metrics. Re-qualify in 30 days if no response.';
  } else if (intent === 'complaint') {
    businessInsight = 'Customer retention opportunity. Swift resolution can convert detractor to promoter. Track resolution time and customer satisfaction metrics.';
  } else {
    businessInsight = 'Standard business communication requiring professional response. Maintain response time SLAs to ensure customer satisfaction and operational efficiency.';
  }

  return {
    riskLevel,
    reason,
    businessImpact,
    recommendedAction,
    suggestedReply,
    leadQualityScore: isLead ? leadQualityScore : undefined,
    businessInsight,
    isLead,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const analysis = analyzeMessage(message);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
