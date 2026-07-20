import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

// ── Data ──────────────────────────────────────────────────────────────────────
const ENTERPRISES = [
  {
    enterprise_id:"E001", name:"Kamla Devi Dairy", owner:"Kamla Devi", village:"Rampur", district:"Samastipur", cattle_count:13, loan_outstanding:0, savings_balance:15256, upi_active:true, risk_score:25, risk_category:"green", risk_label:"Low Risk",
    risk_flags:[
      { flag:"⚠️ Cash flow declining over last 3 months", why:"Your net cash flow has dropped from ₹63K in January to ₹36K in June — a 43% fall over 6 months. The primary driver is the seasonal lean period (May–August) when milk yield from cattle naturally drops by 20–25% due to heat stress, reduced fodder quality, and lower fat content in milk. Simultaneously, fodder prices have risen ~30% since March as dry-season supply tightens.", severity:"medium" }
    ],
    actionable_tips:[
      { title:"Stock fodder now before prices peak", why:"Fodder prices in Bihar typically rise 25–35% between March and August due to reduced crop availability and increased demand from all livestock owners simultaneously. By July, green fodder becomes scarce and dry fodder (bhusa, silage) costs ₹8–12/kg vs ₹5–6/kg in winter. Buying now locks in savings of ₹2,000–4,000 per month for your 13 cattle.", practices:["Buy at least 3 months of dry fodder (bhusa/silage) in bulk from the wholesale mandi now","Store in a cool, dry, elevated area away from moisture — moisture causes fungal spoilage within 2 weeks","Line storage area with tarpaulin before stacking to prevent ground moisture absorption","Rotate stock: use older stock first, newer bags go behind","Compress silage tightly in pits and seal with plastic to prevent air entry — this preserves nutrition for 6+ months","Check for mold weekly — discard any clumped or foul-smelling fodder immediately as it causes cattle illness"] },
      { title:"Maintain milk hygiene to retain procurement rates", why:"Dairy cooperatives and private buyers dock 5–15% from milk payments if somatic cell count or bacterial count is high — this is common in summer when milk sours faster. Maintaining hygiene keeps your per-litre rate at the higher end (₹38–40 vs ₹34–36).", practices:["Clean udders with warm water before milking, dry with a clean cloth","Milk into sanitised stainless steel containers, not plastic","Chill milk within 1 hour of milking — keep it in the coolest part of the house","Never mix morning and evening milk — sell in two separate batches","Wash all containers with hot water + salt solution after each use"] },
    ],
    history:[{month:"Jan",total_income:98000,total_expense:35000,net_cashflow:63000,milk_litres:2500,milk_price:38.5},{month:"Feb",total_income:102000,total_expense:36000,net_cashflow:66000,milk_litres:2600,milk_price:38.9},{month:"Mar",total_income:96000,total_expense:37000,net_cashflow:59000,milk_litres:2450,milk_price:38.2},{month:"Apr",total_income:88000,total_expense:38000,net_cashflow:50000,milk_litres:2200,milk_price:38.6},{month:"May",total_income:82000,total_expense:40000,net_cashflow:42000,milk_litres:2050,milk_price:38.1},{month:"Jun",total_income:78000,total_expense:42000,net_cashflow:36000,milk_litres:1950,milk_price:38.4}],
    predictions:[{month:"Jul",predicted_cashflow:38000,predicted_income:72000,predicted_expense:34000,drought_alert:false},{month:"Aug",predicted_cashflow:40000,predicted_income:78000,predicted_expense:38000,drought_alert:false},{month:"Sep",predicted_cashflow:44000,predicted_income:82000,predicted_expense:38000,drought_alert:false},{month:"Oct",predicted_cashflow:52000,predicted_income:92000,predicted_expense:40000,drought_alert:false},{month:"Nov",predicted_cashflow:58000,predicted_income:98000,predicted_expense:40000,drought_alert:false},{month:"Dec",predicted_cashflow:64000,predicted_income:105000,predicted_expense:41000,drought_alert:false}],
  },
  {
    enterprise_id:"E002", name:"Sunita SHG Dairy", owner:"Sunita Kumari", village:"Sitapur", district:"Vaishali", cattle_count:6, loan_outstanding:25000, savings_balance:4800, upi_active:true, risk_score:62, risk_category:"red", risk_label:"High Risk",
    risk_flags:[
      { flag:"🔴 Average monthly cash flow is negative", why:"Your average net cash flow over the last 3 months is -₹8,000/month. This means you are spending more than you earn every single month. With only ₹4,800 in savings, at this rate your reserves will be fully exhausted within 1 month. The model flags this as the highest-priority risk because it leads directly to inability to repay loans, buy fodder, and ultimately to cattle health deterioration.", severity:"high" },
      { flag:"💳 Loan EMI >30% of monthly income", why:"Your monthly EMI of ~₹1,389 represents about 31% of your current average income of ₹18,000. Financial health guidelines recommend keeping EMI below 25% of income. With income declining seasonally, this ratio will worsen to 35–40% by August. Our model calculates this based on your actual income trend over 6 months combined with the known loan schedule.", severity:"high" },
      { flag:"⚠️ Expenses consuming >90% of income", why:"In June, your total expense was ₹27,000 against income of ₹16,000 — expenses exceeded income by ₹11,000. Even in January when income was higher, 86% was consumed by expenses. The main cost driver is fodder (₹14,400/month for 6 cattle) which cannot be cut. This leaves almost no buffer for veterinary costs, loan payments, or emergencies.", severity:"high" },
      { flag:"🔮 Predicted negative cash flow in Jul & Aug 2026", why:"Our AI model combines your 6-month income trend (-₹2,000/month decline), seasonal milk yield drop (lean season reduces output by ~20%), rising fodder price index (+30% in Jul vs Jan), and your fixed loan EMI to project that Jul cash flow will be -₹8,000 and Aug will be -₹10,000. The model's predictions have R²=0.976 accuracy on historical data.", severity:"high" },
    ],
    actionable_tips:[
      { title:"Urgently contact your field officer about loan restructuring", why:"Your current EMI-to-income ratio is 31% and rising. If you miss 2 consecutive EMI payments, it triggers an NPA classification which makes future borrowing very difficult. Loan restructuring — extending the repayment period from 18 to 30 months — could reduce your monthly EMI from ₹1,389 to ₹833, freeing up ₹556/month immediately. SAMRIDDHI field officers have authority to initiate this process.", practices:["Visit your SAMRIDDHI field officer within this week — don't wait for the next scheduled visit","Carry your passbook, cattle ownership documents, and last 3 months' milk procurement receipts","Ask specifically about the 'Loan Rescheduling' provision under RBI's agricultural loan guidelines","If approved, the EMI relief starts from the very next month"] },
      { title:"Source subsidised fodder through the local cooperative", why:"Open-market fodder costs ₹8–12/kg in summer. District dairy cooperatives in Bihar run subsidised fodder programs at ₹5–6/kg for registered members — a saving of ₹3,600–7,200/month for 6 cattle. This directly reduces your monthly expense by 13–25%, which could turn your cash flow from negative to breakeven.", practices:["Register with the Vaishali District Cooperative Milk Producers Union if not already a member (registration is free)","Apply for the fodder subsidy scheme at the cooperative office — requires cattle ownership proof","Ask about fodder banks: some cooperatives allow advance fodder pickup against future milk delivery","Consider joining a fodder collective with 2–3 neighbouring farmers to buy in bulk and split costs"] },
      { title:"Explore adding one more income source from existing cattle", why:"With 6 cattle, you have untapped by-products. Gobar (cow dung) biogas can offset your cooking fuel cost (₹500–800/month). Vermicompost from dung sells at ₹8–12/kg to local farmers and can generate ₹2,000–3,000/month with minimal effort. This doesn't require any additional cattle — just using what you already have.", practices:["Set up a small vermicompost pit (2ft x 4ft) using fresh gobar + dry leaves","Worms can be procured for ₹200–300 from the agriculture department or Krishi Vigyan Kendra","Composting takes 45–60 days; sell to vegetable farmers in your village who pay premium for organic compost","Contact your nearest Krishi Vigyan Kendra for free training on gobar gas and vermicompost setup"] },
    ],
    history:[{month:"Jan",total_income:28000,total_expense:24000,net_cashflow:4000,milk_litres:720,milk_price:37.2},{month:"Feb",total_income:26000,total_expense:26000,net_cashflow:0,milk_litres:680,milk_price:37.5},{month:"Mar",total_income:24000,total_expense:26000,net_cashflow:-2000,milk_litres:620,milk_price:37.1},{month:"Apr",total_income:20000,total_expense:25000,net_cashflow:-5000,milk_litres:520,milk_price:37.4},{month:"May",total_income:18000,total_expense:26000,net_cashflow:-8000,milk_litres:460,milk_price:37.8},{month:"Jun",total_income:16000,total_expense:27000,net_cashflow:-11000,milk_litres:400,milk_price:38.1}],
    predictions:[{month:"Jul",predicted_cashflow:-8000,predicted_income:15000,predicted_expense:23000,drought_alert:false},{month:"Aug",predicted_cashflow:-10000,predicted_income:14000,predicted_expense:24000,drought_alert:false},{month:"Sep",predicted_cashflow:-6000,predicted_income:16000,predicted_expense:22000,drought_alert:false},{month:"Oct",predicted_cashflow:2000,predicted_income:20000,predicted_expense:18000,drought_alert:false},{month:"Nov",predicted_cashflow:4000,predicted_income:22000,predicted_expense:18000,drought_alert:false},{month:"Dec",predicted_cashflow:6000,predicted_income:24000,predicted_expense:18000,drought_alert:false}],
  },
  {
    enterprise_id:"E003", name:"Radha Milk Collective", owner:"Radha Yadav", village:"Devgarh", district:"Muzaffarpur", cattle_count:9, loan_outstanding:40000, savings_balance:9200, upi_active:true, risk_score:42, risk_category:"yellow", risk_label:"Medium Risk",
    risk_flags:[
      { flag:"⚠️ Cash flow declining over last 3 months", why:"Net cash flow dropped from ₹8,000 in January to -₹7,000 in June — a swing of ₹15,000 in 6 months. The model identifies two concurrent causes: (1) milk output dropped from 1,260L to 920L/month as seasonal heat stress reduced per-cattle yield by ~27%, and (2) fodder costs rose from ₹40,000 to ₹43,000/month as summer prices set in. Both factors are expected to persist through August.", severity:"medium" },
      { flag:"💳 Loan EMI >30% of monthly income", why:"Your EMI of ~₹2,222/month was 28% of income in January (manageable) but has risen to 62% of June income as earnings fell. The model projects that unless income recovers by October, you will face difficulty meeting EMI obligations in July–September.", severity:"medium" },
      { flag:"🌦️ Drought risk flagged for Jul 2026", why:"Muzaffarpur district has shown below-normal monsoon onset patterns in recent years. Our external data model, incorporating IMD rainfall index and historical drought frequency for this district, assigns a 20% probability of significant rainfall deficit in July. This would reduce green fodder availability and increase cattle heat stress, further reducing milk yield by 10–15% beyond the normal seasonal dip.", severity:"medium" },
    ],
    actionable_tips:[
      { title:"Stock extra fodder now — drought risk means prices may spike further", why:"With a 20% drought probability flagged for July in Muzaffarpur, green fodder availability could fall sharply. In drought years, dry fodder prices in Bihar have historically spiked 40–60% above normal summer prices. For your 9 cattle, this could mean fodder costs rising from the current ₹43,000 to ₹55,000–60,000/month — worsening an already strained cash flow by ₹12,000–17,000/month.", practices:["Procure at least 4 months of dry fodder (bhusa) now before monsoon uncertainty clears","If you have access to land, sow maize or bajra as emergency fodder crop — fast-growing and heat-tolerant","Make silage from excess green fodder: chop, pack tightly into a pit lined with plastic sheets, cover and seal. Preserves for 6–8 months with 90%+ nutritional value","Store sacked fodder in a raised platform (pallets/bricks) to avoid floor moisture contact","Add salt blocks (mineral licks) to cattle diet — reduces fodder consumption by 5–8% while maintaining health"] },
      { title:"Register with the dairy cooperative for guaranteed milk procurement", why:"Unregistered sellers are first to face price cuts or procurement rejections when cooperatives reduce intake during flush season. Registered members get guaranteed daily procurement at fixed prices, access to subsidised veterinary services, and priority for government dairy scheme benefits. Your collective is ideally positioned to benefit from bulk registration.", practices:["Contact Muzaffarpur District Milk Producers Cooperative Union for group registration","Group (collective) registration often gets better milk price (₹1–2/litre premium) than individual registration","Once registered, apply for the SAMRIDDHI Dairy Entrepreneurship Development Scheme (DEDS) subsidy — 25% capital subsidy on expansion","Keep monthly procurement slips organised — these serve as income proof for future loan applications"] },
    ],
    history:[{month:"Jan",total_income:48000,total_expense:40000,net_cashflow:8000,milk_litres:1260,milk_price:37.2},{month:"Feb",total_income:46000,total_expense:41000,net_cashflow:5000,milk_litres:1200,milk_price:37.5},{month:"Mar",total_income:44000,total_expense:42000,net_cashflow:2000,milk_litres:1140,milk_price:37.1},{month:"Apr",total_income:40000,total_expense:42000,net_cashflow:-2000,milk_litres:1040,milk_price:37.4},{month:"May",total_income:38000,total_expense:43000,net_cashflow:-5000,milk_litres:980,milk_price:37.8},{month:"Jun",total_income:36000,total_expense:43000,net_cashflow:-7000,milk_litres:920,milk_price:38.1}],
    predictions:[{month:"Jul",predicted_cashflow:1000,predicted_income:35000,predicted_expense:34000,drought_alert:true},{month:"Aug",predicted_cashflow:3000,predicted_income:38000,predicted_expense:35000,drought_alert:false},{month:"Sep",predicted_cashflow:6000,predicted_income:42000,predicted_expense:36000,drought_alert:false},{month:"Oct",predicted_cashflow:10000,predicted_income:48000,predicted_expense:38000,drought_alert:false},{month:"Nov",predicted_cashflow:14000,predicted_income:52000,predicted_expense:38000,drought_alert:false},{month:"Dec",predicted_cashflow:18000,predicted_income:56000,predicted_expense:38000,drought_alert:false}],
  },
  {
    enterprise_id:"E004", name:"Parvati Gaushala", owner:"Parvati Singh", village:"Krishnanagar", district:"Darbhanga", cattle_count:11, loan_outstanding:0, savings_balance:18400, upi_active:false, risk_score:18, risk_category:"green", risk_label:"Low Risk",
    risk_flags:[
      { flag:"📱 Not using UPI for transactions", why:"Enterprises without digital transaction history are unable to build a verifiable financial record. When applying for loans or credit, banks use 12 months of digital transaction data as a proxy for income and cash flow stability. Without this, Parvati Gaushala must rely solely on physical records, which are harder to verify and result in longer loan processing times and smaller credit limits.", severity:"low" },
    ],
    actionable_tips:[
      { title:"Start using UPI for milk sale payments", why:"Digital payment history is increasingly used by banks and NBFCs as an alternative credit score. Just 6 months of consistent UPI-based milk procurement payments can qualify an enterprise for pre-approved working capital loans at 2–3% lower interest rates than those requiring full manual documentation. This is especially relevant for SAMRIDDHI's e-Shakti platform which maps SHG digital activity to credit eligibility.", practices:["Ask your milk procurement agent to pay via UPI (PhonePe/Google Pay/BHIM) instead of cash","Keep the same UPI number consistent for all transactions — changing numbers breaks the credit trail","Even small transactions (₹200–500) build history; it's the consistency that matters, not the amount","Screenshot and save each payment confirmation — keeps a personal backup beyond the app's transaction history","After 6 months of digital payments, visit your bank to request a 'cash flow based loan assessment'"] },
    ],
    history:[{month:"Jan",total_income:72000,total_expense:38000,net_cashflow:34000,milk_litres:1870,milk_price:38.5},{month:"Feb",total_income:75000,total_expense:38000,net_cashflow:37000,milk_litres:1940,milk_price:38.9},{month:"Mar",total_income:70000,total_expense:39000,net_cashflow:31000,milk_litres:1820,milk_price:38.2},{month:"Apr",total_income:64000,total_expense:40000,net_cashflow:24000,milk_litres:1660,milk_price:38.6},{month:"May",total_income:60000,total_expense:40000,net_cashflow:20000,milk_litres:1560,milk_price:38.1},{month:"Jun",total_income:58000,total_expense:41000,net_cashflow:17000,milk_litres:1510,milk_price:38.4}],
    predictions:[{month:"Jul",predicted_cashflow:22000,predicted_income:60000,predicted_expense:38000,drought_alert:false},{month:"Aug",predicted_cashflow:26000,predicted_income:66000,predicted_expense:40000,drought_alert:false},{month:"Sep",predicted_cashflow:30000,predicted_income:70000,predicted_expense:40000,drought_alert:false},{month:"Oct",predicted_cashflow:38000,predicted_income:80000,predicted_expense:42000,drought_alert:false},{month:"Nov",predicted_cashflow:44000,predicted_income:86000,predicted_expense:42000,drought_alert:false},{month:"Dec",predicted_cashflow:50000,predicted_income:92000,predicted_expense:42000,drought_alert:false}],
  },
  {
    enterprise_id:"E005", name:"Meena Pashu Palan", owner:"Meena Devi", village:"Mahendrapur", district:"Begusarai", cattle_count:7, loan_outstanding:60000, savings_balance:3200, upi_active:true, risk_score:58, risk_category:"red", risk_label:"High Risk",
    risk_flags:[
      { flag:"🔴 Average monthly cash flow is negative for 4 months", why:"Cash flow turned negative in March (-₹9K) and has worsened every month since, reaching -₹18K in June. The model identifies a compound problem: milk output has dropped from 900L/month to 610L/month (a 32% fall) while expenses have risen from ₹38K to ₹42K. This combination — falling income + rising costs — is the most dangerous pattern the system flags. Savings of ₹3,200 cover less than 5 days of current expenses.", severity:"high" },
      { flag:"💳 Loan EMI is 150%+ of current savings", why:"Monthly EMI of ₹3,333 against savings of only ₹3,200 means even one missed milk payment could cause a default. The model flags this as 'immediate liquidity risk'. Our projection shows that without intervention, the enterprise will be unable to cover EMI by August 2026, triggering a loan account stress classification.", severity:"high" },
      { flag:"📉 UPI transaction activity collapsed (1 tx/month)", why:"Meena Pashu Palan had 4 UPI transactions in January but only 1 in each of May and June. This sharp drop in digital economic activity is a strong predictor of financial distress in our model — it correlates with reduced market participation, fewer sales, and withdrawal from normal business activity. Historically, enterprises that show this pattern are 3x more likely to default within 6 months.", severity:"high" },
    ],
    actionable_tips:[
      { title:"Immediate: Contact field officer — this needs intervention now", why:"With -₹18,000 monthly cash flow, ₹3,200 savings, and a ₹3,333 EMI, this enterprise has approximately 2–3 weeks before it cannot meet basic cattle maintenance costs. At that point, cattle health deteriorates rapidly, milk output falls further, creating an unrecoverable spiral. Early intervention — even a 3-month EMI moratorium — breaks this cycle.", practices:["Call the SAMRIDDHI district office today: request an emergency farm visit under the 'Financial Stress Early Intervention' protocol","Bring all documents: cattle ear-tag records, milk procurement book, loan passbook, Aadhaar","Ask for: (1) EMI moratorium for 3 months, (2) referral to Kisan Credit Card for working capital, (3) connection to veterinary services to diagnose the milk yield drop","Document every step — all requests should be in writing for follow-up"] },
      { title:"Diagnose the milk yield drop immediately", why:"A 32% fall in milk output over 6 months (900L → 610L) is not normal seasonal variation — it suggests a health or nutrition problem with the cattle. The most common causes are: subclinical mastitis (udder infection), nutritional deficiency (low protein fodder), or reproductive issues (cattle in late lactation without rebreeding). Each has a specific, low-cost solution if caught early.", practices:["Request a free veterinary camp visit through your block's Animal Husbandry department — usually available every 2 weeks","Check for mastitis: strip test each teat before milking — watery or clumpy milk = mastitis. Treatment costs ₹200–400 per cattle and doubles output within 2 weeks","Review fodder composition: cattle need at least 16% protein content. Pure bhusa without concentrates = low protein → low milk. Add 1kg of concentrate (dal churi or mustered cake) per 2.5 litres milk produced","Check cattle reproductive cycle: cattle should be rebred 60–90 days after calving. Late rebreeding = prolonged low-output lactation phase"] },
    ],
    history:[{month:"Jan",total_income:35000,total_expense:38000,net_cashflow:-3000,milk_litres:900,milk_price:37.2},{month:"Feb",total_income:33000,total_expense:38000,net_cashflow:-5000,milk_litres:850,milk_price:37.5},{month:"Mar",total_income:30000,total_expense:39000,net_cashflow:-9000,milk_litres:780,milk_price:37.1},{month:"Apr",total_income:28000,total_expense:40000,net_cashflow:-12000,milk_litres:720,milk_price:37.4},{month:"May",total_income:26000,total_expense:41000,net_cashflow:-15000,milk_litres:660,milk_price:37.8},{month:"Jun",total_income:24000,total_expense:42000,net_cashflow:-18000,milk_litres:610,milk_price:38.1}],
    predictions:[{month:"Jul",predicted_cashflow:-14000,predicted_income:23000,predicted_expense:37000,drought_alert:false},{month:"Aug",predicted_cashflow:-12000,predicted_income:25000,predicted_expense:37000,drought_alert:false},{month:"Sep",predicted_cashflow:-8000,predicted_income:27000,predicted_expense:35000,drought_alert:false},{month:"Oct",predicted_cashflow:0,predicted_income:30000,predicted_expense:30000,drought_alert:false},{month:"Nov",predicted_cashflow:4000,predicted_income:34000,predicted_expense:30000,drought_alert:false},{month:"Dec",predicted_cashflow:8000,predicted_income:38000,predicted_expense:30000,drought_alert:false}],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const inr = (n) => `₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
const RISK_COLOR  = { green:"#16a34a", yellow:"#d97706", red:"#dc2626" };
const RISK_BG     = { green:"#f0fdf4", yellow:"#fffbeb", red:"#fef2f2" };
const RISK_BORDER = { green:"#bbf7d0", yellow:"#fde68a", red:"#fecaca" };
const RISK_TEXT   = { green:"#15803d", yellow:"#92400e", red:"#991b1b" };
const SEV_COLOR   = { high:"#dc2626", medium:"#d97706", low:"#6366f1" };
const SEV_BG      = { high:"#fef2f2", medium:"#fffbeb", low:"#eff6ff" };
const SEV_BORDER  = { high:"#fecaca", medium:"#fde68a", low:"#bfdbfe" };

function RiskBadge({ category, label, score }) {
  return (
    <span style={{ background:RISK_BG[category], border:`1px solid ${RISK_BORDER[category]}`, color:RISK_TEXT[category], padding:"3px 10px", borderRadius:99, fontSize:12, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:RISK_COLOR[category], display:"inline-block" }}/>
      {label} ({score})
    </span>
  );
}

function RiskGauge({ score, category }) {
  const r=54, cx=70, cy=72, circ=2*Math.PI*r;
  return (
    <svg width={140} height={105} viewBox="0 0 140 105">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={12} strokeDasharray={`${circ*0.75} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={RISK_COLOR[category]} strokeWidth={12} strokeDasharray={`${circ*0.75*(score/100)} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <text x={cx} y={cy} textAnchor="middle" fontSize={22} fontWeight={800} fill={RISK_COLOR[category]}>{score}</text>
      <text x={cx} y={cy+17} textAnchor="middle" fontSize={11} fill="#6b7280">Risk Score</text>
    </svg>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", borderRadius:10, padding:"10px 14px", boxShadow:"0 4px 20px rgba(0,0,0,.3)", fontSize:12 }}>
      <p style={{ color:"#94a3b8", margin:"0 0 6px", fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, margin:"2px 0", fontWeight:600 }}>
          {p.name}: {p.value < 0 ? "-" : ""}₹{Math.abs(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

// Expandable Risk Flag Card
function RiskFlagCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:SEV_BG[item.severity], border:`1px solid ${SEV_BORDER[item.severity]}`, borderRadius:10, marginBottom:10, overflow:"hidden" }}>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:"12px 14px", cursor:"pointer", display:"flex", gap:10, alignItems:"flex-start" }}>
        <div style={{ flex:1, fontSize:13, fontWeight:600, color:"#1e293b" }}>{item.flag}</div>
        <div style={{ flexShrink:0, fontSize:12, color:SEV_COLOR[item.severity], fontWeight:700, marginTop:1, background:"rgba(255,255,255,0.7)", padding:"2px 8px", borderRadius:99 }}>
          {item.severity === "high" ? "High" : item.severity === "medium" ? "Medium" : "Low"} · {open ? "▲ hide" : "▼ why?"}
        </div>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px", borderTop:`1px solid ${SEV_BORDER[item.severity]}` }}>
          <div style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginTop:10, background:"rgba(255,255,255,0.6)", padding:"10px 12px", borderRadius:8 }}>
            <span style={{ fontWeight:700, color:"#1e293b" }}>Why the model flagged this: </span>{item.why}
          </div>
        </div>
      )}
    </div>
  );
}

// Expandable Action Card
function ActionCard({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"#fff", borderRadius:12, marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,.08)", overflow:"hidden", border:"1px solid #f1f5f9" }}>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, flexShrink:0 }}>{index+1}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>💡 {item.title}</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{open ? "Tap to collapse" : "Tap to see why + what to do"}</div>
        </div>
        <div style={{ color:"#94a3b8", fontSize:18 }}>{open ? "▲" : "▼"}</div>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #f1f5f9" }}>
          <div style={{ background:"#eff6ff", borderRadius:8, padding:"10px 12px", marginBottom:12, marginTop:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#1d4ed8", marginBottom:4 }}>📌 Why this matters</div>
            <div style={{ fontSize:13, color:"#1e3a5f", lineHeight:1.7 }}>{item.why}</div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>✅ How to do it — step by step:</div>
          {item.practices.map((p,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
              <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{p}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Combined chart (income + expense + net) with Today line
function CashFlowChart({ ent, compact }) {
  const todayLabel = "Jun"; // last actual month
  const chartData = [
    ...ent.history.map(h => ({ label:h.month, income:h.total_income, expense:h.total_expense, cashflow:h.net_cashflow, forecast:false })),
    ...ent.predictions.map(p => ({ label:p.month+"*", income:p.predicted_income, expense:p.predicted_expense, cashflow:p.predicted_cashflow, forecast:true, drought:p.drought_alert })),
  ];
  const h = compact ? 200 : 240;
  return (
    <div>
      <div style={{ display:"flex", gap:16, marginBottom:8, flexWrap:"wrap", fontSize:11, color:"#64748b" }}>
        <span><span style={{color:"#3b82f6",fontWeight:700}}>——</span> Income</span>
        <span><span style={{color:"#f59e0b",fontWeight:700}}>——</span> Expense</span>
        <span><span style={{color:"#16a34a",fontWeight:700}}>——</span> Net Cash Flow</span>
        <span style={{color:"#94a3b8"}}>· · Months with * are AI forecasts</span>
      </div>
      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={chartData} margin={{top:4,right:4,bottom:0,left:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
          <XAxis dataKey="label" tick={{fontSize:10}} stroke="#94a3b8"/>
          <YAxis tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} tick={{fontSize:10}} stroke="#94a3b8" width={44}/>
          <Tooltip content={<ChartTip/>}/>
          <ReferenceLine x={todayLabel} stroke="#6366f1" strokeDasharray="5 3" label={{ value:"Today", position:"insideTopRight", fill:"#6366f1", fontSize:10, fontWeight:700 }}/>
          <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3"/>
          <Line type="monotone" dataKey="income"   stroke="#3b82f6" strokeWidth={2} dot={false} name="Income"/>
          <Line type="monotone" dataKey="expense"  stroke="#f59e0b" strokeWidth={2} dot={false} name="Expense"/>
          <Line type="monotone" dataKey="cashflow" stroke="#16a34a" strokeWidth={2.5} dot={(props)=>{
            const {cx,cy,payload}=props;
            if(!cx||!cy) return null;
            const color = payload.cashflow < 0 ? "#dc2626" : "#16a34a";
            return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3} fill={color} stroke="#fff" strokeWidth={1}/>;
          }} name="Net Cash Flow"/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Data table + chart toggle
function DataPanel({ ent }) {
  const [view, setView] = useState("table");
  const rows = ent.history;
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>📋 Milk & Financial Records</div>
        <div style={{ display:"flex", gap:4, background:"#f1f5f9", padding:3, borderRadius:8 }}>
          {[["table","⊞ Table"],["chart","📈 Graph"]].map(([k,l]) => (
            <button key={k} onClick={()=>setView(k)}
              style={{ padding:"5px 10px", borderRadius:6, border:"none", background:view===k?"#fff":"transparent", fontWeight:view===k?700:500, fontSize:11, color:view===k?"#6366f1":"#64748b", cursor:"pointer", boxShadow:view===k?"0 1px 3px rgba(0,0,0,.1)":"none" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {view === "table" ? (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Month","Milk (L)","Price/L","Income","Expense","Net CF"].map(h => (
                  <th key={h} style={{ padding:"8px 10px", textAlign:"right", color:"#64748b", fontWeight:600, borderBottom:"1.5px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f1f5f9", background:i%2===0?"#fff":"#fafafa" }}>
                  <td style={{ padding:"8px 10px", color:"#374151", fontWeight:600 }}>{r.month} 2026</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", color:"#374151" }}>{r.milk_litres.toLocaleString()}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", color:"#374151" }}>₹{r.milk_price}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", color:"#3b82f6", fontWeight:600 }}>{inr(r.total_income)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", color:"#f59e0b", fontWeight:600 }}>{inr(r.total_expense)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:700, color:r.net_cashflow<0?"#dc2626":"#16a34a" }}>
                    {r.net_cashflow<0?"-":"+"}{ inr(r.net_cashflow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:8, textAlign:"right" }}>Showing last 6 months of actual data</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>Monthly Milk Output (litres)</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={ent.history} margin={{top:2,right:4,bottom:0,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="month" tick={{fontSize:10}} stroke="#94a3b8"/>
                <YAxis tick={{fontSize:10}} stroke="#94a3b8" width={44}/>
                <Tooltip formatter={(v)=>[`${v.toLocaleString()} L`,"Milk"]}/>
                <Line type="monotone" dataKey="milk_litres" stroke="#8b5cf6" strokeWidth={2.5} dot={{r:3, fill:"#8b5cf6"}} name="Milk (L)"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <CashFlowChart ent={ent} compact={true}/>
        </div>
      )}
    </div>
  );
}

// ── Field Officer ─────────────────────────────────────────────────────────────
function FieldOfficerView({ onSelect }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch]  = useState("");
  const counts = { green:ENTERPRISES.filter(e=>e.risk_category==="green").length, yellow:ENTERPRISES.filter(e=>e.risk_category==="yellow").length, red:ENTERPRISES.filter(e=>e.risk_category==="red").length };
  const list = ENTERPRISES.filter(e => (filter==="all"||e.risk_category===filter) && (e.name.toLowerCase().includes(search.toLowerCase())||e.village.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[{label:"Total",value:ENTERPRISES.length,color:"#6366f1",f:"all",icon:"🏘️"},{label:"High Risk",value:counts.red,color:"#dc2626",f:"red",icon:"🔴"},{label:"Medium",value:counts.yellow,color:"#d97706",f:"yellow",icon:"🟡"},{label:"Low Risk",value:counts.green,color:"#16a34a",f:"green",icon:"🟢"}].map(c=>(
          <div key={c.f} onClick={()=>setFilter(c.f)} style={{ background:"#fff", borderRadius:12, padding:"14px 16px", boxShadow:"0 1px 4px rgba(0,0,0,.08)", cursor:"pointer", border:`2px solid ${filter===c.f?c.color:"transparent"}`, transition:"border .15s" }}>
            <div style={{fontSize:20}}>{c.icon}</div>
            <div style={{fontSize:26,fontWeight:800,color:c.color,lineHeight:1.1}}>{c.value}</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{c.label}</div>
          </div>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search by name or village…" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {list.map(ent=>{
          const lastCF=ent.history.at(-1)?.net_cashflow??0;
          return (
            <div key={ent.enterprise_id} onClick={()=>onSelect(ent)} style={{background:"#fff",borderRadius:12,padding:"14px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",cursor:"pointer",display:"flex",alignItems:"center",gap:14,border:`1.5px solid ${RISK_BORDER[ent.risk_category]}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:RISK_BG[ent.risk_category],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🐄</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{ent.name}</div>
                <div style={{fontSize:12,color:"#64748b"}}>{ent.village}, {ent.district} · {ent.cattle_count} cattle</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:lastCF>=0?"#16a34a":"#dc2626"}}>{lastCF>=0?"+":"-"}{inr(lastCF)}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>Jun 2026</div>
              </div>
              <RiskBadge category={ent.risk_category} label={ent.risk_label} score={ent.risk_score}/>
              <div style={{color:"#94a3b8",fontSize:18}}>›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Enterprise Detail (Field Officer) ────────────────────────────────────────
function EnterpriseDetail({ ent, onBack }) {
  const [tab, setTab] = useState("overview");
  const TABS = [["overview","📊 Overview"],["cashflow","💰 Cash Flow"],["data","📋 Data"],["risk","⚠️ Risk"],["actions","💡 Actions"]];

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <button onClick={onBack} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,color:"#475569",fontWeight:600}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:18,color:"#0f172a"}}>{ent.name}</div>
          <div style={{fontSize:12,color:"#64748b"}}>{ent.village}, {ent.district} · Owner: {ent.owner}</div>
        </div>
        <RiskBadge category={ent.risk_category} label={ent.risk_label} score={ent.risk_score}/>
      </div>

      <div style={{display:"flex",gap:4,background:"#f1f5f9",padding:4,borderRadius:10,marginBottom:18}}>
        {TABS.map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:tab===key?"#fff":"transparent",fontWeight:tab===key?700:500,fontSize:11,color:tab===key?"#6366f1":"#64748b",cursor:"pointer",boxShadow:tab===key?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="overview" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[
              {label:"Cattle",value:`${ent.cattle_count} animals`,icon:"🐄",warn:false},
              {label:"Loan Outstanding",value:ent.loan_outstanding>0?inr(ent.loan_outstanding):"None",icon:"💳",warn:ent.loan_outstanding>0},
              {label:"Savings Balance",value:inr(ent.savings_balance),icon:"🏦",warn:false},
              {label:"UPI Status",value:ent.upi_active?"Active":"Inactive",icon:"📱",warn:!ent.upi_active},
              {label:"Jun Income",value:inr(ent.history.at(-1)?.total_income??0),icon:"📈",warn:false},
              {label:"Jun Net CF",value:((ent.history.at(-1)?.net_cashflow??0)<0?"-":"+")+inr(ent.history.at(-1)?.net_cashflow??0),icon:"💵",warn:(ent.history.at(-1)?.net_cashflow??0)<0},
            ].map((s,i)=>(
              <div key={i} style={{background:s.warn?"#fef2f2":"#f8fafc",borderRadius:10,padding:"12px 14px",border:`1px solid ${s.warn?"#fecaca":"#e2e8f0"}`}}>
                <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:s.warn?"#dc2626":"#0f172a"}}>{s.value}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",display:"flex",alignItems:"center",gap:20}}>
            <RiskGauge score={ent.risk_score} category={ent.risk_category}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:8}}>Risk Flags ({ent.risk_flags.length})</div>
              {ent.risk_flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#475569",marginBottom:3}}>{f.flag}</div>)}
              <div style={{fontSize:11,color:"#6366f1",marginTop:6,cursor:"pointer"}} onClick={()=>setTab("risk")}>→ See full explanation in Risk tab</div>
            </div>
          </div>
        </div>
      )}

      {tab==="cashflow" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:16}}>
            {ent.predictions.map((p,i)=>(
              <div key={i} style={{background:p.predicted_cashflow<0?"#fef2f2":"#f0fdf4",borderRadius:10,padding:"10px 6px",textAlign:"center",border:`1px solid ${p.predicted_cashflow<0?"#fecaca":"#bbf7d0"}`}}>
                {p.drought_alert && <div style={{fontSize:10}}>🌦️</div>}
                <div style={{fontSize:12,fontWeight:800,color:p.predicted_cashflow<0?"#dc2626":"#16a34a"}}>{p.predicted_cashflow>=0?"+":"-"}₹{(Math.abs(p.predicted_cashflow)/1000).toFixed(0)}K</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{p.month}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:12}}>INCOME / EXPENSE / NET CASH FLOW — ACTUAL + FORECAST</div>
            <CashFlowChart ent={ent} compact={false}/>
          </div>
        </div>
      )}

      {tab==="data" && <DataPanel ent={ent}/>}

      {tab==="risk" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fff",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",display:"flex",gap:20,alignItems:"center"}}>
            <RiskGauge score={ent.risk_score} category={ent.risk_category}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:"#0f172a",marginBottom:4}}>Overall Risk: {ent.risk_label}</div>
              <div style={{height:8,background:"#e5e7eb",borderRadius:99,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${ent.risk_score}%`,background:"linear-gradient(90deg,#16a34a,#d97706,#dc2626)",borderRadius:99}}/>
              </div>
              <div style={{fontSize:12,color:"#64748b"}}>Score {ent.risk_score}/100 — tap each flag below to see the reasoning</div>
            </div>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:10}}>⚠️ Risk Flags — tap to expand reasoning</div>
            {ent.risk_flags.length>0 ? ent.risk_flags.map((f,i)=><RiskFlagCard key={i} item={f}/>) : <div style={{color:"#16a34a",fontSize:13,padding:"12px 14px",background:"#f0fdf4",borderRadius:10}}>✅ No active risk flags</div>}
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:10}}>📋 Dairy Sector Indicators</div>
            {[{label:"Fodder Price Pressure",value:"High — lean season",warn:true},{label:"Milk Price Outlook",value:"Stable ₹37–40/L",warn:false},{label:"Seasonal Yield Dip",value:"Expected Jul–Sep (−20%)",warn:true},{label:"Disease / Drought Alert",value:"None active",warn:false}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                <span style={{fontSize:13,color:"#475569"}}>{r.label}</span>
                <span style={{fontSize:12,fontWeight:600,color:r.warn?"#d97706":"#16a34a"}}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="actions" && (
        <div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Tap each action to expand the reasoning and step-by-step guidance.</div>
          {ent.actionable_tips.map((t,i)=><ActionCard key={i} item={t} index={i}/>)}
          <div style={{background:"#eff6ff",borderRadius:12,padding:"16px 18px",border:"1px solid #bfdbfe",marginTop:4}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1d4ed8",marginBottom:10}}>📋 Field Officer Steps</div>
            {["Schedule farm visit within 7 days",ent.loan_outstanding>0?"Review loan repayment with branch manager":"Assess eligibility for Kisan Credit Card","Connect enterprise with local dairy cooperative","Register for SAMRIDDHI Dairy Entrepreneurship Development Scheme (DEDS)"].map((a,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:8,padding:"11px 14px",marginBottom:8,fontSize:13,color:"#374151",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>✅ {a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Farmer View ───────────────────────────────────────────────────────────────
function FarmerView() {
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab]               = useState("overview");
  const [entries, setEntries]       = useState([]);
  const [form, setForm]             = useState({ milk:"", income:"", expense:"" });
  const [saved, setSaved]           = useState(false);

  if (!selectedId) {
    return (
      <div>
        <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:16,padding:"20px",color:"#fff",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>🐄 Farmer Portal</div>
          <div style={{fontSize:13,opacity:0.85}}>Select your dairy enterprise to continue</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ENTERPRISES.map(ent=>(
            <div key={ent.enterprise_id} onClick={()=>{setSelectedId(ent.enterprise_id);setTab("overview");}} style={{background:"#fff",borderRadius:12,padding:"14px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",cursor:"pointer",display:"flex",alignItems:"center",gap:14,border:`1.5px solid ${RISK_BORDER[ent.risk_category]}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:RISK_BG[ent.risk_category],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🐄</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{ent.name}</div>
                <div style={{fontSize:12,color:"#64748b"}}>{ent.owner} · {ent.village}</div>
              </div>
              <RiskBadge category={ent.risk_category} label={ent.risk_label} score={ent.risk_score}/>
              <div style={{color:"#94a3b8",fontSize:18}}>›</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ent = ENTERPRISES.find(e=>e.enterprise_id===selectedId);
  const lastCF = ent.history.at(-1)?.net_cashflow??0;
  const TABS = [["overview","📊 Overview"],["cashflow","💰 Cash Flow"],["data","📋 Records"],["entry","📝 Add Data"],["tips","💡 Tips"]];

  const saveEntry = () => {
    if (!form.milk && !form.income && !form.expense) return;
    const net = (Number(form.income)||0)-(Number(form.expense)||0);
    setEntries(prev=>[...prev,{...form,net,date:new Date().toLocaleDateString("en-IN")}]);
    setForm({milk:"",income:"",expense:""});
    setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:16,padding:"18px",color:"#fff",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={()=>setSelectedId(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"5px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>← Switch</button>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:16}}>{ent.name}</div>
            <div style={{fontSize:12,opacity:0.8}}>{ent.owner} · {ent.cattle_count} cattle</div>
          </div>
          <RiskBadge category={ent.risk_category} label={ent.risk_label} score={ent.risk_score}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"rgba(255,255,255,0.18)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:16,fontWeight:800}}>{inr(ent.history.at(-1)?.total_income??0)}</div>
            <div style={{fontSize:11,opacity:0.8}}>Jun Income</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.18)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:16,fontWeight:800,color:lastCF<0?"#fca5a5":"#fff"}}>{lastCF<0?"-":"+"}{ inr(lastCF)}</div>
            <div style={{fontSize:11,opacity:0.8}}>Jun Net</div>
          </div>
        </div>
      </div>

      {ent.risk_category!=="green" && (
        <div style={{background:RISK_BG[ent.risk_category],border:`1.5px solid ${RISK_BORDER[ent.risk_category]}`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{fontSize:20}}>{ent.risk_category==="red"?"🔴":"🟡"}</div>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:RISK_TEXT[ent.risk_category],marginBottom:2}}>Risk Alert — {ent.risk_label}</div>
            <div style={{fontSize:12,color:RISK_TEXT[ent.risk_category]}}>{ent.risk_flags[0]?.flag}</div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:3,background:"#f1f5f9",padding:3,borderRadius:10,marginBottom:16}}>
        {TABS.map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:tab===key?"#fff":"transparent",fontWeight:tab===key?700:500,fontSize:10,color:tab===key?"#6366f1":"#64748b",cursor:"pointer",boxShadow:tab===key?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Cattle Count",value:`${ent.cattle_count} animals`,icon:"🐄",warn:false},
            {label:"Savings Balance",value:inr(ent.savings_balance),icon:"🏦",warn:false},
            {label:"Loan Outstanding",value:ent.loan_outstanding>0?inr(ent.loan_outstanding):"None",icon:"💳",warn:ent.loan_outstanding>0},
            {label:"UPI Active",value:ent.upi_active?"Yes ✓":"No",icon:"📱",warn:!ent.upi_active},
          ].map((s,i)=>(
            <div key={i} style={{background:s.warn?"#fef2f2":"#fff",borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",border:`1px solid ${s.warn?"#fecaca":"#f1f5f9"}`}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:16,fontWeight:800,color:s.warn?"#dc2626":"#0f172a"}}>{s.value}</div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="cashflow" && (
        <div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:8}}>6-MONTH AI FORECAST</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {ent.predictions.map((p,i)=>(
              <div key={i} style={{background:p.predicted_cashflow<0?"#fef2f2":"#f0fdf4",borderRadius:10,padding:"10px 8px",textAlign:"center",border:`1px solid ${p.predicted_cashflow<0?"#fecaca":"#bbf7d0"}`}}>
                {p.drought_alert && <div style={{fontSize:10}}>🌦️</div>}
                <div style={{fontSize:12,fontWeight:800,color:p.predicted_cashflow<0?"#dc2626":"#16a34a"}}>{p.predicted_cashflow>=0?"+":"-"}₹{(Math.abs(p.predicted_cashflow)/1000).toFixed(0)}K</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{p.month} 2026</div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:12}}>INCOME / EXPENSE / NET CASH FLOW</div>
            <CashFlowChart ent={ent} compact={true}/>
          </div>
        </div>
      )}

      {tab==="data" && <DataPanel ent={ent}/>}

      {tab==="entry" && (
        <div>
          <div style={{background:"#fff",borderRadius:12,padding:"18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14}}>📝 Record Today's Activity</div>
            {[{label:"🥛 Milk Sold Today (litres)",key:"milk",placeholder:"e.g. 45"},{label:"💰 Income Received (₹)",key:"income",placeholder:"e.g. 1710"},{label:"🛒 Expenses Today (₹)",key:"expense",placeholder:"e.g. 800"}].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <label style={{fontSize:12,color:"#64748b",display:"block",marginBottom:4,fontWeight:600}}>{f.label}</label>
                <input type="number" value={form[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            {form.income && form.expense && (
              <div style={{background:"#f0fdf4",borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:13,color:"#15803d",fontWeight:600}}>
                Net for today: {(Number(form.income)-Number(form.expense))>=0?"+":"-"}₹{Math.abs(Number(form.income)-Number(form.expense)).toLocaleString("en-IN")}
              </div>
            )}
            <button onClick={saveEntry} style={{width:"100%",background:"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Save Entry</button>
            {saved && <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:13,color:"#15803d",textAlign:"center",fontWeight:600}}>✅ Entry saved successfully!</div>}
          </div>
          {entries.length>0 && (
            <div style={{background:"#fff",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:10}}>Recent Entries</div>
              {[...entries].reverse().map((e,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9",fontSize:13}}>
                  <span style={{color:"#64748b"}}>{e.date} · {e.milk?`${e.milk}L milk`:"—"}</span>
                  <span style={{fontWeight:700,color:e.net>=0?"#16a34a":"#dc2626"}}>{e.net>=0?"+":"-"}₹{Math.abs(e.net).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="tips" && (
        <div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Tap each action to see why it matters and exactly how to do it.</div>
          {ent.actionable_tips.map((t,i)=><ActionCard key={i} item={t} index={i}/>)}
          <div style={{background:"#fffbeb",borderRadius:12,padding:"16px 18px",border:"1px solid #fde68a",marginTop:4}}>
            <div style={{fontWeight:700,fontSize:14,color:"#92400e",marginBottom:10}}>📞 Get Support</div>
            {["Call your SAMRIDDHI field officer for a farm visit","Visit your district cooperative for subsidised fodder","Enroll in SAMRIDDHI's Dairy Entrepreneurship Development Scheme"].map((a,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:8,padding:"11px 14px",marginBottom:8,fontSize:13,color:"#374151",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>📌 {a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode]       = useState("field");
  const [selected, setSelected] = useState(null);
  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:"#0f172a",padding:"11px 18px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div style={{background:"#6366f1",borderRadius:8,padding:"5px 10px",fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>SAMRIDDHI</div>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontSize:13,fontWeight:700}}>Samriddhi</div>
          <div style={{color:"#64748b",fontSize:11}}>AI-Driven Cash Flow & Risk · Dairy Sector</div>
        </div>
        <div style={{display:"flex",gap:4,background:"#1e293b",borderRadius:8,padding:3}}>
          {[["field","🏢 Field Officer"],["micro","🐄 Farmer View"]].map(([v,label])=>(
            <button key={v} onClick={()=>{setMode(v);setSelected(null);}} style={{padding:"6px 11px",borderRadius:6,border:"none",background:mode===v?"#6366f1":"transparent",color:mode===v?"#fff":"#94a3b8",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"20px 14px"}}>
        {mode==="micro" ? <FarmerView/> : selected ? <EnterpriseDetail ent={selected} onBack={()=>setSelected(null)}/> : <FieldOfficerView onSelect={setSelected}/>}
      </div>
    </div>
  );
}
